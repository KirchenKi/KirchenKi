import React, { useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Download, FileText, Trash2, Loader2, Filter, CalendarDays, X, ArrowLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

type Sermon = {
  id: string;
  title: string;
  status: string;
  created_at: string;
  original_file_name: string | null;
};

type Material = {
  id: string;
  sermon_id: string;
  group_name: string | null;
  file_name: string;
  file_path: string;
  generated_at?: string | null;
  created_at?: string | null;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('de-DE');
};

function deduplicateBy<T>(items: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [activeTab, setActiveTab] = useState('sermons');
  const [selectedSermonId, setSelectedSermonId] = useState<string | null>(null);
  const [deletingSermonId, setDeletingSermonId] = useState<string | null>(null);
  const [deletingMaterialId, setDeletingMaterialId] = useState<string | null>(null);
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');

  const selectedSermon = useMemo(
    () => sermons.find((sermon) => sermon.id === selectedSermonId) || null,
    [sermons, selectedSermonId]
  );

  const availableGroups = useMemo(() => {
    const groups = new Set(materials.map((m) => m.group_name || 'Allgemein'));
    return Array.from(groups).sort();
  }, [materials]);

  const availableMonths = useMemo(() => {
    const months = new Set(
      materials.map((m) => {
        const d = new Date(m.generated_at ?? m.created_at ?? '');
        if (Number.isNaN(d.getTime())) return null;
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      }).filter(Boolean) as string[]
    );
    return Array.from(months).sort().reverse();
  }, [materials]);

  const formatMonth = (key: string) => {
    const [year, month] = key.split('-');
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
  };

  const filteredMaterials = useMemo(() => {
    let result = selectedSermonId
      ? materials.filter((m) => m.sermon_id === selectedSermonId)
      : materials;

    if (groupFilter !== 'all') {
      result = result.filter((m) => (m.group_name || 'Allgemein') === groupFilter);
    }

    if (monthFilter !== 'all') {
      result = result.filter((m) => {
        const d = new Date(m.generated_at ?? m.created_at ?? '');
        if (Number.isNaN(d.getTime())) return false;
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return key === monthFilter;
      });
    }

    return result;
  }, [materials, selectedSermonId, groupFilter, monthFilter]);

  const groupedByMonth = useMemo(() => {
    const groups: Record<string, Material[]> = {};
    for (const m of filteredMaterials) {
      const d = new Date(m.generated_at ?? m.created_at ?? '');
      const key = Number.isNaN(d.getTime())
        ? 'Unbekannt'
        : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    }
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredMaterials]);

  const activeFilterCount = (groupFilter !== 'all' ? 1 : 0) + (monthFilter !== 'all' ? 1 : 0);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    const { data: sermonsData, error: sermonError } = await supabase
      .from('sermons')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (sermonError) {
      toast({
        title: 'Fehler',
        description: 'Predigten konnten nicht geladen werden.',
        variant: 'destructive',
      });
    } else {
      const deduped = deduplicateBy(sermonsData ?? [], (s) => `${s.title}||${s.original_file_name ?? ''}`);
      setSermons(deduped);
    }

    const { data: materialsData, error: materialError } = await supabase
      .from('generated_materials')
      .select('*')
      .eq('user_id', user.id);

    if (materialError) {
      toast({
        title: 'Fehler',
        description: 'Materialien konnten nicht geladen werden.',
        variant: 'destructive',
      });
    } else {
      const sorted = [...(materialsData ?? [])].sort((a, b) => {
        const aTime = new Date(a.generated_at ?? a.created_at ?? 0).getTime();
        const bTime = new Date(b.generated_at ?? b.created_at ?? 0).getTime();
        return bTime - aTime;
      });
      const deduped = deduplicateBy(sorted, (m) => `${m.sermon_id}||${m.group_name ?? ''}||${m.file_name}`);
      setMaterials(deduped);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const deleteSermon = async (sermonId: string) => {
    if (!confirm('Predigt und alle zugehörigen Materialien wirklich löschen?')) return;
    setDeletingSermonId(sermonId);

    const relatedMaterials = materials.filter((m) => m.sermon_id === sermonId);
    if (relatedMaterials.length > 0) {
      const filePaths = relatedMaterials.map((m) => m.file_path);
      const { error: storageError } = await supabase.storage
        .from('materials')
        .remove(filePaths);
      if (storageError) console.warn('[Dashboard] Storage delete error:', storageError);

      const { error: matDeleteError } = await supabase
        .from('generated_materials')
        .delete()
        .eq('sermon_id', sermonId);
      if (matDeleteError) console.warn('[Dashboard] Materials delete error:', matDeleteError);
    }

    const { error } = await supabase
      .from('sermons')
      .delete()
      .eq('id', sermonId);

    if (error) {
      console.error('[Dashboard] Sermon delete error:', error);
      toast({ title: 'Fehler', description: 'Predigt konnte nicht gelöscht werden.', variant: 'destructive' });
    } else {
      toast({ title: 'Gelöscht', description: 'Predigt und Materialien wurden entfernt.' });
      await loadData();
    }
    setDeletingSermonId(null);
  };

  const deleteMaterial = async (material: Material) => {
    if (!confirm('Material wirklich löschen?')) return;
    setDeletingMaterialId(material.id);

    const { error: storageError } = await supabase.storage
      .from('materials')
      .remove([material.file_path]);
    if (storageError) console.warn('[Dashboard] Storage delete error:', storageError);

    const { error } = await supabase
      .from('generated_materials')
      .delete()
      .eq('id', material.id);

    if (error) {
      console.error('[Dashboard] Material delete error:', error);
      toast({ title: 'Fehler', description: 'Material konnte nicht gelöscht werden.', variant: 'destructive' });
    } else {
      toast({ title: 'Gelöscht', description: 'Material wurde entfernt.' });
      await loadData();
    }
    setDeletingMaterialId(null);
  };

  const findRealFilePath = async (originalPath: string): Promise<string> => {
    // 1. Clean path (remove prefixes)
    const cleanPath = originalPath
      .trim()
      .replace(/\\/g, '/')
      .replace(/^\/+/, '')
      .replace(/^storage\/materials\//i, '')
      .replace(/^materials\//i, '');
      
    // 2. Split into folder and filename
    const parts = cleanPath.split('/');
    if (parts.length < 2) return cleanPath; // No folder structure, try as is

    const folderName = parts[0];
    const fileName = parts.slice(1).join('/');

    try {
      // 3. Find real folder name (case insensitive)
      const { data: rootFiles } = await supabase.storage.from('materials').list();
      let realFolder = folderName;
      
      if (rootFiles) {
          const foundFolder = rootFiles.find(f => f.name.toLowerCase() === folderName.toLowerCase());
          if (foundFolder) realFolder = foundFolder.name;
      }

      // 4. Find real file name in that folder
      const { data: folderFiles } = await supabase.storage.from('materials').list(realFolder);
      
      if (folderFiles) {
          const foundFile = folderFiles.find(f => f.name.toLowerCase() === fileName.toLowerCase());
          if (foundFile) {
              const realPath = `${realFolder}/${foundFile.name}`;
              console.log(`[Dashboard] Resolved path: "${originalPath}" -> "${realPath}"`);
              return realPath;
          }
      }
    } catch (e) {
      console.warn('[Dashboard] Path resolution failed:', e);
    }

    return cleanPath; // Fallback to cleaned path
  };

  const downloadMaterial = async (filePath: string, fileName: string) => {
    try {
      const realPath = await findRealFilePath(filePath);

      const { data, error } = await supabase.storage
        .from('materials')
        .createSignedUrl(realPath, 3600);

      if (error || !data?.signedUrl) throw error || new Error('No signed URL');

      console.log('[Dashboard] Downloading from:', data.signedUrl);

      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download-Fehler:', err);
      toast({
        title: 'Download fehlgeschlagen',
        description: 'Die Datei wurde im Speicher nicht gefunden.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 w-full px-4 md:px-8 py-12">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-2">
                Dashboard
              </h1>
              <p className="text-muted-foreground">
                Verwalte deine Predigten und lade Materialien herunter.
              </p>
            </div>
            <Button
              onClick={() => { window.location.href = '/tool.html'; }}
              className="rounded-full self-start md:self-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zum Eingabetool
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="sermons">Meine Predigten</TabsTrigger>
              <TabsTrigger value="materials">Meine Materialien</TabsTrigger>
            </TabsList>

            <TabsContent value="sermons" className="mt-6">
              {loading ? (
                <p className="text-muted-foreground">Lade Predigten...</p>
              ) : sermons.length === 0 ? (
                <Card className="bg-secondary/40">
                  <CardContent className="py-6 text-muted-foreground">
                    Noch keine Predigten hochgeladen.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {sermons.map((sermon) => (
                    <Card key={sermon.id} className="bg-card/80">
                      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <CardTitle className="text-lg">{sermon.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(sermon.created_at)} · Status: {sermon.status}
                          </p>
                          {sermon.original_file_name && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Datei: {sermon.original_file_name}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              setSelectedSermonId(sermon.id);
                              setActiveTab('materials');
                            }}
                            className="rounded-full"
                          >
                            Materialien ansehen
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => deleteSermon(sermon.id)}
                            disabled={deletingSermonId === sermon.id}
                          >
                            {deletingSermonId === sermon.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="materials" className="mt-6 space-y-5">
              {selectedSermon && (
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    Materialien für: <span className="text-foreground font-medium">{selectedSermon.title}</span>
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setSelectedSermonId(null)}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Filter aufheben
                  </Button>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={groupFilter} onValueChange={setGroupFilter}>
                    <SelectTrigger className="w-[180px] h-9 rounded-full bg-secondary/50 border-border">
                      <SelectValue placeholder="Alle Gruppen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Gruppen</SelectItem>
                      {availableGroups.map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <Select value={monthFilter} onValueChange={setMonthFilter}>
                    <SelectTrigger className="w-[200px] h-9 rounded-full bg-secondary/50 border-border">
                      <SelectValue placeholder="Alle Monate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Monate</SelectItem>
                      {availableMonths.map((m) => (
                        <SelectItem key={m} value={m}>{formatMonth(m)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground rounded-full"
                    onClick={() => { setGroupFilter('all'); setMonthFilter('all'); setSelectedSermonId(null); }}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Alle Filter zurücksetzen
                  </Button>
                )}

                <Badge variant="secondary" className="ml-auto text-xs">
                  {filteredMaterials.length} {filteredMaterials.length === 1 ? 'Material' : 'Materialien'}
                </Badge>
              </div>

              {loading ? (
                <p className="text-muted-foreground">Lade Materialien...</p>
              ) : filteredMaterials.length === 0 ? (
                <Card className="bg-secondary/40">
                  <CardContent className="py-6 text-muted-foreground">
                    {activeFilterCount > 0
                      ? 'Keine Materialien für die gewählten Filter gefunden.'
                      : 'Noch keine Materialien vorhanden.'}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-8">
                  {groupedByMonth.map(([monthKey, monthMaterials]) => (
                    <div key={monthKey}>
                      <div className="flex items-center gap-3 mb-4">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                          {monthKey === 'Unbekannt' ? 'Unbekannt' : formatMonth(monthKey)}
                        </h3>
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs text-muted-foreground">
                          {monthMaterials.length} {monthMaterials.length === 1 ? 'Dokument' : 'Dokumente'}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {monthMaterials.map((material) => (
                          <Card key={material.id} className="bg-card/80">
                            <CardContent className="pt-6 space-y-3">
                              <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-xl bg-secondary/70 flex items-center justify-center">
                                  <FileText className="h-5 w-5 text-primary" />
                                </div>
                                <div className="space-y-1 min-w-0 flex-1">
                                  <p className="font-medium text-foreground truncate">{material.file_name}</p>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs font-normal">
                                      {material.group_name || 'Allgemein'}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {formatDate(material.generated_at ?? material.created_at ?? '')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  className="flex-1 rounded-full"
                                  onClick={() => downloadMaterial(material.file_path, material.file_name)}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Herunterladen
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="rounded-full text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                  onClick={() => deleteMaterial(material)}
                                  disabled={deletingMaterialId === material.id}
                                >
                                  {deletingMaterialId === material.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;

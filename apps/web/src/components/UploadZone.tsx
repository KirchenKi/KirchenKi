import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Music, FileType, Check, Loader2, Upload, Mail, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, supabaseUrl, supabaseAnonKey } from '@/lib/supabase';
type UploadStatus = 'idle' | 'dragging' | 'uploading' | 'processing' | 'success' | 'error';

interface UploadedFile {
  name: string;
  type: string;
  size: number;
}

const ACCEPTED_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/m4a',
  'audio/ogg',
  'audio/x-m4a',
  'audio/x-wav',
  'application/pdf',
  'application/msword',
  'application/vnd.ms-word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/octet-stream',
];

const ACCEPTED_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.ogg', '.pdf', '.doc', '.docx'];

const isAcceptedFile = (file: File) => {
  const lowerName = file.name.toLowerCase();
  const hasAcceptedExtension = ACCEPTED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  return ACCEPTED_TYPES.includes(file.type) || hasAcceptedExtension;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (type: string) => {
  if (type.startsWith('audio/')) return Music;
  if (type.includes('pdf')) return FileType;
  return FileText;
};

type TargetAudience =
  | 'kindergruppe'
  | 'jungschar_royal_ranger'
  | 'teenie_kreis'
  | 'konfi'
  | 'jugend'
  | 'junge_erwachsene'
  | 'hauskreis'
  | 'bibelstunde'
  | 'maennerkreis'
  | 'frauenkreis'
  | 'ehepaarkreis_familien'
  | 'seniorenkreis';

const TARGET_AUDIENCES: { id: TargetAudience; label: string }[] = [
  { id: 'kindergruppe', label: 'Kindergruppe' },
  { id: 'jungschar_royal_ranger', label: 'Jungschar / Royal Ranger' },
  { id: 'teenie_kreis', label: 'Teenie-Kreis' },
  { id: 'konfi', label: 'Konfi' },
  { id: 'jugend', label: 'Jugend' },
  { id: 'junge_erwachsene', label: 'Junge Erwachsene' },
  { id: 'hauskreis', label: 'Hauskreis' },
  { id: 'bibelstunde', label: 'Bibelstunde' },
  { id: 'maennerkreis', label: 'Männerkreis' },
  { id: 'frauenkreis', label: 'Frauenkreis' },
  { id: 'ehepaarkreis_familien', label: 'Ehepaarkreis / Familien' },
  { id: 'seniorenkreis', label: 'Seniorenkreis' },
];

const AUDIENCE_VALUE_MAP: Record<TargetAudience, string> = {
  kindergruppe: 'Kindergruppe',
  jungschar_royal_ranger: 'Jungschar / Royal Ranger',
  teenie_kreis: 'Teenie-Kreis',
  konfi: 'Konfi',
  jugend: 'Jugend',
  junge_erwachsene: 'Junge Erwachsene',
  hauskreis: 'Hauskreis',
  bibelstunde: 'Bibelstunde',
  maennerkreis: 'Männerkreis',
  frauenkreis: 'Frauenkreis',
  ehepaarkreis_familien: 'Ehepaarkreis / Familien',
  seniorenkreis: 'Seniorenkreis',
};

interface AudienceConfig {
  selected: boolean;
  emails: string[];
  emailInput: string;
  savedEmails: string[];
}

type AudienceConfigMap = Record<TargetAudience, AudienceConfig>;

const initialAudienceConfig: AudienceConfigMap = {
  kindergruppe: { selected: false, emails: [], emailInput: '', savedEmails: [] },
  jungschar_royal_ranger: { selected: false, emails: [], emailInput: '', savedEmails: [] },
  teenie_kreis: { selected: false, emails: [], emailInput: '', savedEmails: [] },
  konfi: { selected: false, emails: [], emailInput: '', savedEmails: [] },
  jugend: { selected: false, emails: [], emailInput: '', savedEmails: [] },
  junge_erwachsene: { selected: false, emails: [], emailInput: '', savedEmails: [] },
  hauskreis: { selected: false, emails: [], emailInput: '', savedEmails: [] },
  bibelstunde: { selected: false, emails: [], emailInput: '', savedEmails: [] },
  maennerkreis: { selected: false, emails: [], emailInput: '', savedEmails: [] },
  frauenkreis: { selected: false, emails: [], emailInput: '', savedEmails: [] },
  ehepaarkreis_familien: { selected: false, emails: [], emailInput: '', savedEmails: [] },
  seniorenkreis: { selected: false, emails: [], emailInput: '', savedEmails: [] },
};

export const UploadZone: React.FC = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [audienceConfig, setAudienceConfig] = useState<AudienceConfigMap>(initialAudienceConfig);
  const [nurTranskript, setNurTranskript] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadGroupEmails = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error || !data?.group_emails) return;

      setAudienceConfig(prev => {
        const next = { ...prev };
        TARGET_AUDIENCES.forEach((audience) => {
          const emails = Array.isArray(data.group_emails[audience.id]) ? data.group_emails[audience.id] : [];
          next[audience.id] = {
            ...next[audience.id],
            savedEmails: emails,
          };
        });
        return next;
      });
    };

    loadGroupEmails();
  }, [user]);

  const toggleAudience = (id: TargetAudience) => {
    setAudienceConfig(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        selected: !prev[id].selected,
      }
    }));
  };

  const getSelectedAudiences = () => {
    return TARGET_AUDIENCES.filter(a => audienceConfig[a.id].selected).map(a => ({
      id: a.id,
      label: a.label,
      emails: audienceConfig[a.id].emails,
    }));
  };

  const getSelectedGroupValues = () => {
    return TARGET_AUDIENCES.filter(a => audienceConfig[a.id].selected).map(a => AUDIENCE_VALUE_MAP[a.id]);
  };

  const getSelectedGroupEmails = () => {
    return TARGET_AUDIENCES.filter(a => audienceConfig[a.id].selected).reduce((acc, audience) => {
      acc[AUDIENCE_VALUE_MAP[audience.id]] = audienceConfig[audience.id].emails;
      return acc;
    }, {} as Record<string, string[]>);
  };

  const updateEmailInput = (id: TargetAudience, value: string) => {
    setAudienceConfig(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        emailInput: value,
      }
    }));
  };

  const MAX_EMAILS = 6;

  const addEmail = (id: TargetAudience) => {
    const email = audienceConfig[id].emailInput.trim();
    if (email && EMAIL_REGEX.test(email) && audienceConfig[id].emails.length < MAX_EMAILS) {
      setAudienceConfig(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          emails: [...prev[id].emails, email],
          emailInput: '',
        }
      }));
    }
  };

  const removeEmail = (id: TargetAudience, emailIndex: number) => {
    setAudienceConfig(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        emails: prev[id].emails.filter((_, i) => i !== emailIndex),
      }
    }));
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent, id: TargetAudience) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addEmail(id);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (status === 'idle') {
      setStatus('dragging');
    }
  }, [status]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (status === 'dragging') {
      setStatus('idle');
    }
  }, [status]);

  const simulateUpload = useCallback((file: File) => {
    setUploadedFile({
      name: file.name,
      type: file.type,
      size: file.size,
    });
    setSelectedFile(file);
    setStatus('uploading');
    setProgress(0);

    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          setStatus('processing');
          
          // Simulate processing
          setTimeout(() => {
            setStatus('success');
          }, 2000);
          
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!isAcceptedFile(file)) {
      setStatus('error');
      setErrorMessage('Bitte laden Sie eine Audio-Datei (MP3, WAV) oder ein Dokument (PDF, Word) hoch.');
      setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
      }, 4000);
      return;
    }

    simulateUpload(file);
  }, [simulateUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isAcceptedFile(file)) {
      setStatus('error');
      setErrorMessage('Bitte laden Sie eine Audio-Datei (MP3, WAV) oder ein Dokument (PDF, Word) hoch.');
      setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
      }, 4000);
      return;
    }

    simulateUpload(file);
  }, [simulateUpload]);

  const handleClick = useCallback(() => {
    if (status === 'idle' || status === 'success') {
      inputRef.current?.click();
    }
  }, [status]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  const resetUpload = useCallback(() => {
    setStatus('idle');
    setUploadedFile(null);
    setSelectedFile(null);
    setProgress(0);
    setErrorMessage('');
  }, []);

  const handleTranscriptRequest = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (isSubmitting) return;

    const selectedGroups = getSelectedGroupValues();
    const groupEmails = getSelectedGroupEmails();
    const recipientEmails = Object.values(groupEmails).flat();
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement | null;
    const file = selectedFile ?? fileInput?.files?.[0];

    if (!user) {
      setModalMessage('Bitte melde dich an, um fortzufahren.');
      return;
    }

    if (selectedGroups.length === 0) {
      setModalMessage('Bitte mindestens eine Kleingruppe auswählen.');
      return;
    }

    if (recipientEmails.length === 0) {
      setModalMessage('Bitte mindestens eine Empfänger-E-Mail für die ausgewählten Gruppen hinzufügen.');
      return;
    }

    if (!file) {
      setModalMessage('Bitte zuerst eine Datei hochladen.');
      return;
    }

    setModalMessage('Die Materialien werden generiert...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('groups', JSON.stringify(selectedGroups));
    formData.append('groupEmails', JSON.stringify(groupEmails));
    formData.append('recipientEmails', JSON.stringify(recipientEmails));
    formData.append('nurTranskript', String(nurTranskript));
    formData.append('email', recipientEmails[0] ?? '');
    formData.append('user_id', user.id);
    const predigtDatum = new Date(file.lastModified).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    formData.append('title', `Predigt: ${predigtDatum}`);
    formData.append('original_file_name', file.name);
    formData.append('sermon_id', '');

    try {
      setIsSubmitting(true);
      const getAccessToken = async () => {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.access_token) return sessionData.session.access_token;

        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError || !refreshData.session?.access_token) {
          throw new Error('Login-Session fehlt oder ist abgelaufen. Bitte neu anmelden.');
        }
        return refreshData.session.access_token;
      };

      const sendRequest = async (token: string) =>
        fetch(`${supabaseUrl}/functions/v1/generate-materials`, {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: supabaseAnonKey,
          },
        });

      let accessToken = await getAccessToken();
      let response = await sendRequest(accessToken);

      if (response.status === 401) {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        if (!refreshError && refreshData.session?.access_token) {
          accessToken = refreshData.session.access_token;
          response = await sendRequest(accessToken);
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Fehler beim Senden der Anfrage.');
      }

      setModalMessage('Erfolgreich gesendet! Die Materialien kommen per E-Mail.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unbekannter Fehler.';
      if (message.toLowerCase().includes('failed to fetch')) {
        setModalMessage('Die Edge Function ist nicht erreichbar. Bitte prüfen, ob sie deployt ist und CORS korrekt gesetzt ist.');
      } else {
        setModalMessage(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const FileIcon = uploadedFile ? getFileIcon(uploadedFile.type) : null;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        className={cn(
          'upload-zone cursor-pointer p-8 md:p-12 lg:p-16',
          status === 'dragging' && 'dragging',
          status === 'success' && 'success',
          status === 'error' && 'border-destructive bg-destructive/5'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Datei hochladen. Klicken oder Datei hierher ziehen."
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Glow effect */}
        <div className="upload-glow" aria-hidden="true" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <AnimatePresence mode="wait">
            {/* Idle State */}
            {status === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Upload className="w-10 h-10 md:w-12 md:h-12 text-primary" strokeWidth={1.5} />
                </motion.div>
                <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                  Predigt hier einfügen
                </h3>
                <p className="text-muted-foreground text-base md:text-lg mb-4">
                  oder klicken zum Auswählen
                </p>
                <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
                  <span className="px-3 py-1 bg-secondary rounded-full">Audio (MP3, WAV)</span>
                  <span className="px-3 py-1 bg-secondary rounded-full">PDF</span>
                  <span className="px-3 py-1 bg-secondary rounded-full">Word</span>
                </div>
              </motion.div>
            )}

            {/* Dragging State */}
            {status === 'dragging' && (
              <motion.div
                key="dragging"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-6"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <Upload className="w-12 h-12 text-primary" strokeWidth={2} />
                </motion.div>
                <h3 className="text-2xl font-semibold text-accent">
                  Jetzt loslassen!
                </h3>
              </motion.div>
            )}

            {/* Uploading State */}
            {status === 'uploading' && uploadedFile && (
              <motion.div
                key="uploading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center w-full"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <FileIcon className="w-8 h-8 text-primary" />
                </div>
                <p className="font-semibold text-lg text-foreground mb-1 truncate max-w-full px-4">
                  {uploadedFile.name}
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  {formatFileSize(uploadedFile.size)}
                </p>
                <div className="w-full max-w-md">
                  <div className="progress-bar">
                    <motion.div
                      className="progress-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-center mt-3 text-muted-foreground">
                    Wird hochgeladen... {Math.round(Math.min(progress, 100))}%
                  </p>
                </div>
              </motion.div>
            )}

            {/* Processing State */}
            {status === 'processing' && uploadedFile && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-10 h-10 text-primary" />
                </motion.div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Wird verarbeitet...
                </h3>
                <p className="text-muted-foreground animate-gentle-pulse">
                  Ihre Predigt wird transkribiert
                </p>
              </motion.div>
            )}

            {/* Success State */}
            {status === 'success' && uploadedFile && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <Check className="w-10 h-10 text-success" strokeWidth={3} />
                </motion.div>
                <h3 className="text-2xl font-semibold text-success mb-2">
                  Erfolgreich!
                </h3>
                <p className="text-muted-foreground mb-2">
                  {uploadedFile.name}
                </p>
                <p className="text-foreground font-medium">
                  Ihr Kleingruppenmaterial wird erstellt
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resetUpload();
                  }}
                  className="mt-6 text-primary hover:text-primary/80 underline underline-offset-4 font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-2 py-1"
                >
                  Weitere Datei hochladen
                </button>
              </motion.div>
            )}

            {/* Error State */}
            {status === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold text-destructive mb-2">
                  Dateiformat nicht unterstützt
                </h3>
                <p className="text-muted-foreground text-center max-w-sm">
                  {errorMessage}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".mp3,.wav,.m4a,.ogg,.pdf,.doc,.docx"
          onChange={handleFileSelect}
          className="sr-only"
          aria-label="Datei auswählen"
        />
      </motion.div>

      {/* Target Audience Selection */}
      <motion.div
        className="mt-8 space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <p className="text-center text-muted-foreground text-sm">
          Kleingruppe(n) auswählen:
        </p>
        
        <div className="flex flex-wrap justify-center gap-3">
          {TARGET_AUDIENCES.map((audience) => (
            <button
              key={audience.id}
              onClick={() => toggleAudience(audience.id)}
              data-value={AUDIENCE_VALUE_MAP[audience.id]}
              className={cn(
                'pill px-5 py-2.5 text-sm font-medium transition-all duration-200',
                'border focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                audienceConfig[audience.id].selected && 'selected'
              )}
            >
              {audienceConfig[audience.id].selected && (
                <Check className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
              )}
              {audience.label}
            </button>
          ))}
        </div>

        {/* Emails from settings and manual input */}
        <AnimatePresence>
          {TARGET_AUDIENCES.filter(a => audienceConfig[a.id].selected).map((audience) => (
            <motion.div
              key={audience.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-secondary/50 rounded-xl p-4 mt-3 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    Empfänger für {audience.label}
                  </span>
                </div>

                {audienceConfig[audience.id].savedEmails.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {audienceConfig[audience.id].savedEmails.map((email, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          if (audienceConfig[audience.id].emails.includes(email)) return;
                          setAudienceConfig(prev => ({
                            ...prev,
                            [audience.id]: {
                              ...prev[audience.id],
                              emails: [...prev[audience.id].emails, email].slice(0, MAX_EMAILS),
                            },
                          }));
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors"
                      >
                        {email}
                        <span className="text-xs text-muted-foreground">(hinzufügen)</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Keine Empfänger hinterlegt. Bitte in den Einstellungen ergänzen.
                  </p>
                )}

                <div className="mt-4">
                  {audienceConfig[audience.id].emails.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {audienceConfig[audience.id].emails.map((email, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                        >
                          {email}
                          <button
                            type="button"
                            onClick={() => removeEmail(audience.id, index)}
                            className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {audienceConfig[audience.id].emails.length < MAX_EMAILS ? (
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="E-Mail-Adresse eingeben..."
                        value={audienceConfig[audience.id].emailInput}
                        onChange={(e) => updateEmailInput(audience.id, e.target.value)}
                        onKeyDown={(e) => handleEmailKeyDown(e, audience.id)}
                        className="flex-1 bg-background"
                      />
                      <button
                        type="button"
                        onClick={() => addEmail(audience.id)}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        Hinzufügen
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Maximum von {MAX_EMAILS} E-Mail-Adressen erreicht
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Transcript Only Section */}
        <motion.div
          className="mt-8 pt-6 border-t border-border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="bg-secondary/50 rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Nur Transkript erhalten
              </span>
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <input
                type="checkbox"
                checked={nurTranskript}
                onChange={(e) => setNurTranskript(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              Nur Transkript (kein Material)
            </label>
            <p className="text-sm text-muted-foreground mb-3">
              Empfänger wählst du pro Gruppe oben aus. Hinterlegte Kontakte können per Klick übernommen werden.
            </p>
            <div className="flex gap-2">
              <button
                id="transkript-anfordern"
                onClick={handleTranscriptRequest}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Wird verarbeitet...' : 'Start'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
      <AnimatePresence>
        {modalMessage && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalMessage(null)}
          >
            <motion.div
              className="w-[90%] max-w-md rounded-2xl border border-border bg-card/90 p-6 text-center shadow-lg"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 6 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-foreground mb-2">Hinweis</h3>
              <p className="text-sm text-muted-foreground">{modalMessage}</p>
              <button
                type="button"
                onClick={() => setModalMessage(null)}
                className="mt-5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                OK
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

import React from 'react';
import { motion } from 'framer-motion';
import { UploadZone } from './UploadZone';

export const UploadSection: React.FC = () => {
  return (
    <section 
      id="upload" 
      className="w-full px-4 md:px-8 py-12 md:py-16"
      aria-labelledby="upload-heading"
    >
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 id="upload-heading" className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            So einfach geht's
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl">
            Laden Sie Ihre Predigt als Audio oder Text hoch
          </p>
        </motion.div>

        {/* Upload Zone */}
        <UploadZone />

        {/* Trust indicators */}
        <motion.div
          className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-4 text-muted-foreground text-base"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success" aria-hidden="true" />
            Sichere Verarbeitung
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success" aria-hidden="true" />
            DSGVO-konform
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success" aria-hidden="true" />
            In Deutschland gehostet
          </span>
        </motion.div>
      </div>
    </section>
  );
};

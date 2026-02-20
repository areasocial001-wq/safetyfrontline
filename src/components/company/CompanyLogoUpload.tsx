import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface CompanyLogoUploadProps {
  companyId: string;
  currentLogoUrl: string | null;
  onLogoUpdated: () => void;
}

export const CompanyLogoUpload = ({
  companyId,
  currentLogoUrl,
  onLogoUpdated,
}: CompanyLogoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Seleziona un file immagine valido (PNG, JPG, etc.)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Il file deve essere inferiore a 2MB');
      return;
    }

    setUploading(true);

    try {
      // Delete old logo if exists
      if (currentLogoUrl) {
        const oldPath = currentLogoUrl.split('/').slice(-2).join('/');
        await supabase.storage.from('company-logos').remove([oldPath]);
      }

      // Upload new logo
      const fileExt = file.name.split('.').pop();
      const fileName = `${companyId}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('company-logos').getPublicUrl(fileName);

      // Update company record
      const { error: updateError } = await supabase
        .from('companies')
        .update({ logo_url: publicUrl })
        .eq('id', companyId);

      if (updateError) throw updateError;

      setPreviewUrl(publicUrl);
      toast.success('Logo caricato con successo!');
      onLogoUpdated();
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Errore nel caricamento del logo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!currentLogoUrl) return;

    try {
      // Delete from storage
      const path = currentLogoUrl.split('/').slice(-2).join('/');
      await supabase.storage.from('company-logos').remove([path]);

      // Update company record
      const { error } = await supabase
        .from('companies')
        .update({ logo_url: null })
        .eq('id', companyId);

      if (error) throw error;

      setPreviewUrl(null);
      toast.success('Logo rimosso con successo');
      onLogoUpdated();
    } catch (error) {
      console.error('Error removing logo:', error);
      toast.error('Errore nella rimozione del logo');
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold mb-1">Logo Aziendale</h3>
        <p className="text-sm text-muted-foreground">
          Il logo apparirà sui certificati dei tuoi dipendenti. Formato consigliato: PNG o JPG,
          massimo 2MB.
        </p>
      </div>

      <div className="space-y-4">
        {/* Logo Preview */}
        {previewUrl ? (
          <div className="relative w-40 h-40 border-2 border-border rounded-lg overflow-hidden bg-muted/50">
            <img
              src={previewUrl}
              alt="Company Logo"
              className="w-full h-full object-contain p-2"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleRemoveLogo}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="w-40 h-40 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/50">
            <ImageIcon className="w-12 h-12 text-muted-foreground" />
          </div>
        )}

        {/* Upload Button */}
        <div>
          <input
            type="file"
            id="logo-upload"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          <label htmlFor="logo-upload">
            <Button
              variant="outline"
              disabled={uploading}
              className="gap-2 cursor-pointer"
              asChild
            >
              <span>
                <Upload className="w-4 h-4" />
                {uploading ? 'Caricamento...' : previewUrl ? 'Cambia Logo' : 'Carica Logo'}
              </span>
            </Button>
          </label>
        </div>
      </div>
    </Card>
  );
};

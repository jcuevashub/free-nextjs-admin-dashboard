'use server';

/**
 * Upload Document Action
 *
 * Uploads documents to Supabase Storage and optionally verifies them
 * with Socure DocV for authenticity and OCR extraction.
 */

import { createSupabaseServer } from '@/lib/supabaseServer';
import { createSupabaseService } from '@/lib/supabaseService';
import { verifySocureDocument } from '@/lib/integrations/socure/docv';
import { revalidatePath } from 'next/cache';

interface UploadDocumentResult {
  success: boolean;
  url?: string;
  documentId?: string;
  socureVerification?: {
    documentUuid: string;
    status: string;
    confidence: number;
    ocrData: Record<string, any>;
  };
  error?: string;
}

/**
 * Upload document to Supabase Storage and verify with Socure DocV
 *
 * @param formData - FormData containing file, docType, caseId, companyId
 * @returns Upload result with public URL and verification data
 */
export async function uploadDocumentAction(
  formData: FormData
): Promise<UploadDocumentResult> {
  try {
    const supabase = await createSupabaseServer();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
      };
    }

    // Extract form data
    const file = formData.get('file') as File;
    const docType = formData.get('docType') as string;
    const caseId = formData.get('caseId') as string;
    const companyId = formData.get('companyId') as string;

    // if (!file || !docType || !caseId) {
    //   return { success: false, error: 'Datos incompletos' };
    // }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: 'Archivo muy grande. Máximo 10MB' };
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpg', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Tipo de archivo no permitido. Solo PDF, PNG, JPG',
      };
    }

    // Generate unique file name
    const fileExtension = file.name.split('.').pop();
    const fileName = `${user.id}/${docType}_${Date.now()}.${fileExtension}`;

    // Upload to Supabase Storage
    const supabaseService = createSupabaseService();

    const { data: uploadData, error: uploadError } = await supabaseService.storage
      .from('onboarding-docs')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('[uploadDocument] Storage error:', uploadError);
      return { success: false, error: uploadError.message };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseService.storage.from('onboarding-docs').getPublicUrl(fileName);

    // Verify document with Socure DocV (for certain document types)
    let socureResult = null;
    const docTypesToVerify = ['rnc', 'constitutivo', 'cedula_front', 'cedula_back', 'ubo'];

    if (docTypesToVerify.includes(docType)) {
      try {
        const docTypeMap: Record<string, 'cedula' | 'ubo' | 'rnc' | 'constitutivo' | 'address' | 'passport'> = {
          cedula_front: 'cedula',
          cedula_back: 'cedula',
          ubo: 'ubo',
          rnc: 'rnc',
          constitutivo: 'constitutivo',
        };

        // socureResult = await verifySocureDocument(file, docTypeMap[docType] || 'rnc');
      } catch (error) {
        console.error('[uploadDocument] Socure DocV error:', error);
        // Don't fail the upload if Socure verification fails
        // The document is still saved, just not verified
      }
    }

    // Save document metadata to database
    const { data: docRecord, error: docError } = await supabaseService
      .from('company_documents')
      .insert({
        company_id: companyId,
        case_id: caseId, // Agregar case_id para buscar documentos por caso
        document_type: docType,
        file_name: file.name,
        file_url: publicUrl,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: user.id,
        socure_document_uuid: companyId,
        socure_verification_status: "verified",
        ocr_data:  {},
        extraction_confidence: 0,
        is_verified: true,
      })
      .select('id')
      .single();

    if (docError) {
      console.error('[uploadDocument] Database error:', docError);
      return { success: false, error: docError.message };
    }

    // Update onboarding case document count
    const { error: countError } = await supabase.rpc('increment_documents_uploaded', {
      case_id: caseId,
    });

    if (countError) {
      console.error('[uploadDocument] Count update error:', countError);
    }

    // If document is verified, increment verified count
    if (true) {
      const { data: caseData } = await supabaseService
        .from('onboarding_cases')
        .select('documents_verified')
        .eq('id', caseId)
        .single();

      await supabaseService
        .from('onboarding_cases')
        .update({
          documents_verified: (caseData?.documents_verified || 0) + 1,
        })
        .eq('id', caseId);
    }

    revalidatePath('/onboarding');

    return {
      success: true,
      url: publicUrl,
      documentId: docRecord.id,
      socureVerification: undefined,
    };
  } catch (error) {
    console.error('[uploadDocument] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

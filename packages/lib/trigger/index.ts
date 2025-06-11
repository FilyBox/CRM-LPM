import { contractInfoTask, extractBodyContractTask } from './example';

interface Template {
  id: string;
  name: string;
  description?: string;
  content: string;
  contentType: 'markdown' | 'pdf' | 'docx';
  fields: TemplateField[];
}

interface TemplateField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'number' | 'currency';
  placeholder?: string;
  required: boolean;
}
type ContractForm = {
  id: number;
  name: string | null;
  url: string | null;
  workspacesId: number | null;
  status: string | null;
  form_fields: TemplateField[] | null;
};

export const getExtractBodyContractTask = async (
  userId: number,
  documentId: number,
  urlDocument: string,
  teamId?: number,
) => {
  const { id } = await extractBodyContractTask.trigger(
    {
      userId: userId,
      documentId: documentId,
      teamId: teamId,
      urlDocument: urlDocument,
    },
    { ttl: '24h' },
  );
  return id;
};

export const getContractInfoTask = async (
  userId: number,
  documentId: number,
  urlDocument: string,
  teamId?: number,
) => {
  const { publicAccessToken, id } = await contractInfoTask.trigger(
    {
      userId: userId,
      documentId: documentId,
      teamId: teamId,
      urlDocument: urlDocument,
    },
    { ttl: '24h' },
    {
      publicAccessToken: {
        expirationTime: '1hr',
      },
    },
  );
  return { publicAccessToken, id };
};

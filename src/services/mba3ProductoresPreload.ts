import { mba3Request } from 'src/services/mba3Api';
import { useAuthStore } from 'src/stores/auth';

export const MBA3_LS_KEY = 'mba3_productores_init';
const MBA3_CODIGO = 'API100';
const MBA3_PWD = 'zaqxsw97531';

export async function precargarMba3Productores(): Promise<void> {
  const authStore = useAuthStore();
  const d = new Date();
  d.setFullYear(d.getFullYear() - 3);
  const fecha3 = d.toISOString().split('T')[0];
  try {
    const data = await mba3Request<unknown>({
      method: 'post',
      endpoint: '/ws_Consulta_externa_MBA3/',
      codigo: MBA3_CODIGO,
      pwd: MBA3_PWD,
      formData: {
        select: 'VENDOR_NAME,RUC_or_FED_ID,FIRST_NAME,ACCOUNT_MNGR,TELEPHONE_MAIN,TELEPHONE_PM,ACCT_CODE,ADDRESS_1,ADDRESS_2,CITY,STATE,ZIP,COUNTRY,NAME_RAZON_SOCIAL,FACSIMILE,E_MAIL',
        from: 'PROV_Ficha_Principal',
        where: `CORP='BGAR1' AND RECORD_DATE > '${fecha3}'`,
        limit: '9999',
      },
    });
    localStorage.setItem(MBA3_LS_KEY, JSON.stringify({
      data,
      ts: Date.now(),
      sedeId: authStore.sedeActivaId ?? 0,
    }));
  } catch {
    // Silencioso: si falla, BasculaFormulario hará la petición directa
  }
}

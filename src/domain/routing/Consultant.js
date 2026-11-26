// LGPD: guarda apenas o necessário para rotear (sem dados pessoais além de id e região).
export class Consultant {
  constructor({ id, region, skills, available }) { Object.assign(this, { id, region, skills, available }); }
}

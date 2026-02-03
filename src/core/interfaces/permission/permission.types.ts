export interface PermissionProfile {
  id: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
}

export interface ProfileWithPermissonsStructure extends PermissionProfile {
  permissions: PermissionStructure[];
}

export interface PermissionStructure {
  resource: ResourceEnum;
  actions: {
    action: ActionEnum;
    active: boolean;
  }[];
}

export enum ResourceEnum {
  AUDITORIA = 'AUDITORIA',
  PROTOCOLO = 'PROTOCOLO',
  SIGNATARIO = 'SIGNATARIO',
  USUARIO = 'USUARIO',
  PERMISSAO = 'PERMISSAO',
}

export enum ActionEnum {
  VISUALIZAR = 'VISUALIZAR',
  EDITAR = 'EDITAR',
  DELETAR = 'DELETAR',
  CRIAR = 'CRIAR',
}

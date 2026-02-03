import {
  PermissionProfile,
  PermissionStructure,
  ProfileWithPermissonsStructure,
} from './permission.types';

export interface IPermissionService {
  getPermissionProfiles(): Promise<PermissionProfile[]>;
  getPermissionStructure(): Promise<PermissionStructure[]>;

  getPermissionsByProfileId(
    profileId: number,
  ): Promise<ProfileWithPermissonsStructure>;

  // updatePermissionProfile(
  //   profileId: string,
  //   permissionStructure: PermissionStructure[],
  // ): Promise<void>;

  // getPermissionByResourceAndAction(
  //   resource: string,
  //   action: string,
  //   userId: string,
  // ): Promise<boolean>;
}

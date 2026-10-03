import { db } from '../db/database';
import {
  PlacementCompany,
  CompanyPreparationProfile,
  PlacementRole,
} from '../models/placementTypes';
import { NotFoundError } from '../core/exceptions';

export class PlacementCompanyRoleService {
  public static async getCompanies(): Promise<PlacementCompany[]> {
    return db.getPlacementCompanies();
  }

  public static async getCompanyById(id: string): Promise<PlacementCompany> {
    const company = await db.getPlacementCompanyById(id);
    if (!company) {
      throw new NotFoundError(`Placement company '${id}' not found`);
    }
    return company;
  }

  public static async getCompanyProfile(
    companyId: string,
    roleId?: string
  ): Promise<CompanyPreparationProfile> {
    await this.getCompanyById(companyId);
    const profile = await db.getCompanyPreparationProfile(companyId, roleId);
    if (!profile) {
      throw new NotFoundError(`No preparation profile found for company '${companyId}'`);
    }
    return profile;
  }

  public static async getRoles(): Promise<PlacementRole[]> {
    return db.getPlacementRoles();
  }

  public static async getRoleById(id: string): Promise<PlacementRole> {
    const role = await db.getPlacementRoleById(id);
    if (!role) {
      throw new NotFoundError(`Placement role '${id}' not found`);
    }
    return role;
  }
}

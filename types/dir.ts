import { IImage, IPm, IPmGroup, ISide } from "./selector";

export interface IPmPointer {
  id: string;
  code: string;
  pm_group: IPmGroup;
}

export interface IDirGroup {
  id: string;
  pms: IPmPointer[];
  icon: IImage;
  en_name: string;
  ru_name: string;
}

export interface IDir {
  id: string;
  groups: IDirGroup[];
}

export interface IActivePetal {
  pm: IPm;
  side: ISide;
}

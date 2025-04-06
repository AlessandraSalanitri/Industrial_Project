import { User } from "firebase/auth";

export type TUser = User & {
  role: string;
};

export type TUserRole = {
  id: string;
  userId: string;
  role: "child" | "parent";
  avatar?: string;
};

export type TMenuItem = {
  id: string;
  title: string;
  url: string;
};

export type TMenuItems = TMenuItem[];

export type TUserInfo = {
  id: string;
  email: string | null;
  displayName: string | null;
};

export type TRequest = {
  id: string;
  user: TUserInfo;
};

export type TEntityRequest = {
  id?: string;
  title: string;
  user: TUserInfo;
};

// export type TAdminRequestGroupItem = {
//   type: string;
//   entities: TEntity[];
// };

// export type TEntity = {
//   id: string;
//   title: string;
//   description: string;
//   type: string;
//   userId?: string;
//   events?: TEvent[];
//   members?: TUserInfo[];
//   requests?: TRequest[];
// };

// export type TClub = Omit<TEntity, "type">;
// export type TGroup = Omit<TEntity, "type">;
// export type TEvent = Omit<TEntity, "type"> & {
//   places: number;
//   datetime: string;
//   latLng?: string;
//   parentId?: string;
//   bookings?: TUserInfo[];
//   isCancled?: boolean;
// };

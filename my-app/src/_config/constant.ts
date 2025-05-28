import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

const HEIGHT_HEADER_ADMIN = 64;
const WIDTH_SIDEBAR_ADMIN = 200;
const PAGE_SIZE_OPTIONS = [5, 10, 50];

export { HEIGHT_HEADER_ADMIN, WIDTH_SIDEBAR_ADMIN, PAGE_SIZE_OPTIONS };

// eslint-disable-next-line no-shadow
export enum ErrorFile {
  maximum = 'File size exceeds limit',
}

export interface MetaPagination {
  page?: number;
  take?: number;
  itemCount?: number;
  pageCount?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

export interface ParameterGet {
  order?: string;
  page?: number;
  take?: number;
  searchKey?: string;
  isActive?: boolean;
}

export interface ParameterReOrder {
  id: string;
  index: number;
}

// eslint-disable-next-line no-shadow
export enum NotificationTypeEnum {
  success = 'success',
  info = 'info',
  warning = 'warning',
  error = 'error',
}

// title button when click add or update
// eslint-disable-next-line no-shadow
export enum AppActionEnum {
  create = 'create',
  update = 'update',
  delete = 'delete',
  reset = 'reset',
}

// eslint-disable-next-line no-shadow
export enum AppConfirmModalEnum {
  delete = 'delete',
  confirm = 'confirm',
  info = 'info',
  warning = 'warning',
}

// eslint-disable-next-line no-shadow
export enum FileTypeEnum {
  image = 'IMAGE',
  video = 'VIDEO',
  file = 'FILE',
}

const path = (root: string, sublink: string) => `${root}${sublink}`;

// client
const ROOTS_CLIENT = '/';

export const CLIENT_PATH = {
  root: ROOTS_CLIENT,
  error: {
    page403: '/403',
    page404: '/404',
    page500: '/500',
  },
};

// admin
const ROOTS_ADMIN = '/admin';

export const ADMIN_PATH = {
  root: ROOTS_ADMIN,
  auth: {
    login: path(ROOTS_ADMIN, '/dang-nhap'),
  },
  dashboard: {
    root: path(ROOTS_ADMIN, '/thong-ke'),
  },
  user: {
    root: path(ROOTS_ADMIN, '/user'),
    new: path(ROOTS_ADMIN, '/user/new'),
    list: path(ROOTS_ADMIN, '/user/list'),
    edit: (name: string) => path(ROOTS_ADMIN, `/user/${name}/edit`),
  },
  error: {
    page403: '/403',
    page404: '/404',
    page500: '/500',
  },
};

export const LOGO_LOGIN_ADMIN = '/images/logo.png';

export const USER_AVATAR_DEFAULT =
  'https://res.cloudinary.com/dvv3iwbyz/image/upload/v1700667930/user_hoohlb.png';
export const NO_IMAGE =
  'https://res.cloudinary.com/dvv3iwbyz/image/upload/v1700667940/no-image_kiurep.png';

export interface IconComponentProps extends CustomIconComponentProps {
  onClick?: () => void;
}

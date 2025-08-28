declare module '@vercel/postgres';
declare module 'pg';
declare module 'bcryptjs';
declare module 'jsonwebtoken';
declare module '@vercel/blob' {
  export function put(path: string, data: any, opts?: any): Promise<any>;
  export function del(path: string, opts?: any): Promise<any>;
  export function head(path: string, opts?: any): Promise<any>;
}
declare module '@storybook/react' {
  export interface Meta<T = any> {
    title?: string;
    component?: any;
    [key: string]: any;
  }
  export interface StoryObj<T = any> {
    args?: any;
    [key: string]: any;
  }
}

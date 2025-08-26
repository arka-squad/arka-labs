declare module '@vercel/postgres';
declare module 'pg';
declare module 'bcryptjs';
declare module 'jsonwebtoken';
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

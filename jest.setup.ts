import '@testing-library/jest-dom';
// Polyfills Web APIs
import { Request, Response } from 'node-fetch';
import { TextEncoder, TextDecoder } from 'util';

// @ts-ignore
global.Request = Request;
// @ts-ignore
global.Response = Response;
// @ts-ignore
global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder;

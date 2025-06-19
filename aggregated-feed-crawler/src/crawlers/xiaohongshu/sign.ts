import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface RequestParams {
  headers: Record<string, string>;
  cookies: Record<string, string>;
  data?: string;
}

interface XsXsCommonResult {
  xs: string;
  xt: string;
  xs_common: string;
}

interface XsResult {
  xs: string;
  xt: string;
}

function generateXB3TraceId(length: number = 16): string {
  const chars = 'abcdef0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * 16)];
  }
  return result;
}

function getCommonHeaders(): Record<string, string> {
  return {
    "authority": "www.xiaohongshu.com",
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "zh-CN,zh;q=0.9",
    "cache-control": "no-cache",
    "pragma": "no-cache",
    "referer": "https://www.xiaohongshu.com/",
    "sec-ch-ua": "\"Chromium\";v=\"122\", \"Not(A:Brand\";v=\"24\", \"Google Chrome\";v=\"122\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "same-origin",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  };
}

function getRequestHeadersTemplate(): Record<string, string> {
  return {
    "authority": "edith.xiaohongshu.com",
    "accept": "application/json, text/plain, */*",
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
    "cache-control": "no-cache",
    "content-type": "application/json;charset=UTF-8",
    "origin": "https://www.xiaohongshu.com",
    "pragma": "no-cache",
    "referer": "https://www.xiaohongshu.com/",
    "sec-ch-ua": "\"Not A(Brand\";v=\"99\", \"Microsoft Edge\";v=\"121\", \"Chromium\";v=\"121\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0",
    "x-b3-traceid": "",
    "x-mns": "unload",
    "x-s": "",
    "x-s-common": "",
    "x-t": "",
    "x-xray-traceid": ""
  };
}

async function callPythonBridge(functionName: string, ...args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const bridgePath = path.join(__dirname, 'scripts', 'bridge.py');
    const pythonProcess = spawn('python3', [bridgePath, functionName, ...args]);
    
    let output = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        resolve(output.trim());
      } else {
        reject(new Error(`Python bridge failed: ${error}`));
      }
    });
  });
}

async function generateXsXsCommon(a1: string, api: string, data: string = ''): Promise<XsXsCommonResult> {
  const result = await callPythonBridge('generate_xs_xs_common', a1, api, data);
  return JSON.parse(result);
}

async function generateXs(a1: string, api: string, data: string = ''): Promise<XsResult> {
  const result = await callPythonBridge('generate_xs', a1, api, data);
  return JSON.parse(result);
}

async function generateXrayTraceId(): Promise<string> {
  return callPythonBridge('generate_xray_traceid');
}

function transCookies(cookiesStr: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  cookiesStr.split(';').forEach(cookie => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) {
      cookies[key] = value;
    }
  });
  return cookies;
}

export async function generateRequestParams(cookiesStr: string, api: string, data: string = ''): Promise<RequestParams> {
  const cookies = transCookies(cookiesStr);
  const a1 = cookies['a1'];
  
  if (!a1) {
    throw new Error('Missing a1 cookie');
  }

  const { xs, xt, xs_common } = await generateXsXsCommon(a1, api, data);
  const x_b3_traceid = generateXB3TraceId();
  const x_xray_traceid = await generateXrayTraceId();

  const headers = getRequestHeadersTemplate();
  headers['x-s'] = xs;
  headers['x-t'] = xt.toString();
  headers['x-s-common'] = xs_common;
  headers['x-b3-traceid'] = x_b3_traceid;
  headers['x-xray-traceid'] = x_xray_traceid;

  return {
    headers,
    cookies,
    data: data ? JSON.stringify(data) : undefined
  };
}
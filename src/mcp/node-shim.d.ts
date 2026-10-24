// 本線實際使用的 node API。與 test/types/node-shim.d.ts 合併，無執行期依賴。
interface McpEmitter {
  on(event: string, listener: (...args: any[]) => void): this;
  once(event: string, listener: (...args: any[]) => void): this;
}
interface McpReadable extends McpEmitter {}
interface McpWritable extends McpEmitter {
  write(text: string): boolean;
  end(): void;
}
interface McpSocket extends McpReadable, McpWritable {
  destroyed: boolean;
  destroy(): void;
}
interface McpProcess {
  stdin: McpReadable; stdout: McpWritable; stderr: McpWritable;
  execPath: string; pid: number;
  on(event: string, listener: (...args: any[]) => void): void;
}
declare module "node:readline" {
  interface Interface extends McpEmitter, AsyncIterable<string> { close(): void }
  export function createInterface(options: { input: McpReadable; crlfDelay?: number }): Interface;
}
declare module "node:net" {
  export interface Server extends McpEmitter {
    listen(path: string, callback?: () => void): this;
    close(callback?: () => void): this;
  }
  export function createServer(listener?: (socket: McpSocket) => void): Server;
  export function createConnection(path: string): McpSocket;
}
declare module "node:child_process" {
  export interface ChildProcess extends McpEmitter {
    stdin: McpWritable; stdout: McpReadable; stderr: McpReadable;
    kill(signal?: string): boolean;
  }
  export function spawn(command: string, args: string[], options?: { stdio?: string | string[]; cwd?: string; env?: Record<string, string | undefined> }): ChildProcess;
}

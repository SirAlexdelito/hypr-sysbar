import Gio from "gi://Gio";
import GLib from "gi://GLib";
import GioUnix from "gi://GioUnix";

export class CavaService {
  private stream: Gio.DataInputStream | null = null;
  private listeners: Array<(bars: number[]) => void> = [];
  private bars: number[] = new Array(20).fill(0);

  onData(cb: (bars: number[]) => void) {
    this.listeners.push(cb);
  }

  private notify() {
    this.listeners.forEach(cb => cb(this.bars));
  }

start() {
  const configPath = `${GLib.get_home_dir()}/.config/cava/cava-ags.conf`;

  const [ok, pid, stdin, stdout, stderr] = GLib.spawn_async_with_pipes(
    null,
    ["cava", "-p", configPath],
    null,
    GLib.SpawnFlags.SEARCH_PATH,
    null
  );

  this.stream = new Gio.DataInputStream({
    base_stream: new GioUnix.InputStream({ fd: stdout!, close_fd: true }),
  });

  const readLoop = () => {
    this.stream!.read_line_async(
      GLib.PRIORITY_LOW,
      null,
      (_: any, result: any) => {
        try {
          const [line] = this.stream!.read_line_finish(result);
          if (line) {
            this.bars = new TextDecoder().decode(line)
              .split(";")
              .filter(Boolean)
              .map(Number);
            this.notify();
          }
          readLoop();
        } catch (e) {
          // stream cerrado
        }
      }
    );
  };

  readLoop();
}

  get data(): number[] {
    return this.bars;
  }

  stop() {
    try {
      this.stream?.close(null);
    } catch (e) {}
    this.stream = null;
  }
}

export const cavaService = new CavaService();
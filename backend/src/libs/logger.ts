import util from "util";

class Logger {
   constructor() {}
   info(...args: string[]) {
      let date = new Date().toISOString();
      console.log(`[info][${date}] - ${args.join(" ")}`);
   }
   error(...args: string[]) {
      let date = new Date().toISOString();
      console.log(`[Error][${date}] - ${args.join(" ")}`);
   }
   debug(...args: string[]) {
      if (!process.argv.slice(3, process.argv.length).includes("--debug")) return;
      let argString = args.map((el) => (typeof el === "object" ? util.inspect(el, false, 2, true) : el));
      let date = new Date().toISOString();
      console.log(`[debug][${date}] - ${argString.join(" ")}`);
   }
}

export default new Logger();

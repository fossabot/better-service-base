#!/usr/bin/env node
import { ServiceBase } from "@bettercorp/service-base";
import {join} from "node:path";

const runApp = async () => {
      const CWD = join(__dirname, "../");
      const SB = new ServiceBase(false, true, CWD);
      await SB.init();
      await SB.run();
      process.exit(0);
};
runApp();

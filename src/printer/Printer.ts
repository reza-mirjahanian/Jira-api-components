import {
  ComponentWithIssueCount,
  IPrint
} from '../Types';
import Logger from "../utils/logger";

export default class Printer {

  constructor(private adaptor: IPrint) {}

  async print(data: ComponentWithIssueCount[]) {
    try {
      await this.adaptor.print(data)

    } catch (e) {
      Logger.error("Printer:print)", {
        message: (e as Error).message
      });
      throw e;
    }
  }
}

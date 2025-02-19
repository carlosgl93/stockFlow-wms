import { createFixture } from "./createFixture";
import { ITransporter } from "modules/transporters/types";

export const TransporterFixture = createFixture<ITransporter>({
  name: "Sample Transporter",
});

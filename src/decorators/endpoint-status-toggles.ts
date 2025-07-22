import { SetMetadata } from "@nestjs/common";

export const DisableEndpoint = () => SetMetadata("disabled", true);

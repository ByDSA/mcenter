import { HistoryInterface } from "@models/history";
import { GroupInterface } from "@models/resources/group";
import { TimestampInterface } from "@models/timestamp";

export type Role = "Admin" | "Guest" | "User";

export default interface Interface extends TimestampInterface {
    name: string;
    role: Role;
    pass: string;
    groups?: GroupInterface[];
    histories?: HistoryInterface[];
}

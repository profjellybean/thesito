import {Tag} from "./Tag";
import {Qualification} from "./Qualification";

export interface Listing {
  // id, title, details, requirement, tags
  id: number,
  title: string,
  details: string,
  requirement: Qualification,
  tags: Tag[]
}

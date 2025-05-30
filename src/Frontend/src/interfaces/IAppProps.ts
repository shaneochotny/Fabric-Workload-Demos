import { History } from "history";
import { WorkloadClientAPI } from "@ms-fabric/workload-client";

export interface IAppProps {
  history: History;
  workloadClient: WorkloadClientAPI;
};
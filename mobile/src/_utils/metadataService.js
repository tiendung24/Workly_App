import api from "./api";

export const metadataService = {
  getDepartments: async () => {
    return api.get("/metadata/departments");
  },
  getPositions: async () => {
    return api.get("/metadata/positions");
  },
};

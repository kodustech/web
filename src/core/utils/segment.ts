import { API_ROUTES } from "../config/constants";
import { axiosAuthorized } from "./axios";
import { pathToApiUrl } from "./helpers";

export function captureSegmentEvent(event: {
    userId: string;
    event: string;
    properties?: any;
}) {
    return axiosAuthorized.post(pathToApiUrl(API_ROUTES.segmentTrack), event);
}

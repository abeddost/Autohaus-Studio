import { handleEnquiryRequest } from "@/lib/enquiries/handler";

export async function POST(request: Request) {
  return handleEnquiryRequest(request);
}

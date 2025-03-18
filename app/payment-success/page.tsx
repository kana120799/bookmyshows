import PaymentSuccess from "@/components/PaymentSuccess";
import { Suspense } from "react";

function page() {
  return (
    <Suspense fallback={<div>Loading payment success...</div>}>
      <PaymentSuccess />
    </Suspense>
  );
}

export default page;

"use client";
import { useTranslations } from "next-intl";
import { Gate } from "@/components/ui/product";
import { Link } from "@/lib/navigation";
export default function PaymentUnavailable() {
  const t = useTranslations("product");
  return (
    <Gate>
      <div className="wrap page narrow stack">
        <h1>{t("paymentUnavailable")}</h1>
        <p>{t("paymentDescription")}</p>
        <Link className="btn-secondary" href="/help">
          {t("help")}
        </Link>
      </div>
    </Gate>
  );
}

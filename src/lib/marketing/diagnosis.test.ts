import { describe, expect, it } from "vitest";
import { buildMarketingDiagnosis, normalizeMarketingUrl } from "./diagnosis";

describe("marketing diagnosis", () => {
  it("normalizes URLs without a protocol", () => {
    expect(normalizeMarketingUrl("demo-shop.hk/product")).toBe("https://demo-shop.hk/product");
  });

  it("builds an ecommerce campaign-ready diagnosis", () => {
    const diagnosis = buildMarketingDiagnosis("https://demo-shop.hk/product");

    expect(diagnosis.domain).toBe("demo-shop.hk");
    expect(diagnosis.type).toBe("ecommerce");
    expect(diagnosis.freeInsights).toHaveLength(3);
    expect(diagnosis.audienceSegments).toHaveLength(3);
    expect(diagnosis.campaignPlan.budget).toContain("HK$");
    expect(diagnosis.campaignPlan.structure.join(" ")).toContain("Campaign objective");
    expect(diagnosis.campaignPlan.copySamples[0].primaryText).toContain("Demo Shop");
  });

  it("uses restaurant-specific audience and copy when the URL suggests F&B", () => {
    const diagnosis = buildMarketingDiagnosis("https://central-cafe.hk/menu");

    expect(diagnosis.type).toBe("restaurant");
    expect(diagnosis.product.price).toBe("HK$188-388");
    expect(diagnosis.audienceSegments[0].name).toBe("Weekend Planners");
    expect(diagnosis.campaignPlan.copySamples[0].cta).toBe("Reserve Now");
  });
});

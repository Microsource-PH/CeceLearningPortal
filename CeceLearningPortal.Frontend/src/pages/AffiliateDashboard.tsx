import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import affiliateService from "@/services/affiliateService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AffiliateDashboard: React.FC = () => {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["affiliate/me"],
    queryFn: async () => (await affiliateService.getMy()).data,
  });
  const { mutate: register, isPending } = useMutation({
    mutationFn: async () => (await affiliateService.register()).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["affiliate/me"] }),
  });

  const code = data?.code;
  const link = code
    ? `${window.location.origin}/?ref=${encodeURIComponent(code)}`
    : "";

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Affiliate Dashboard</h1>
      <div className="p-4 rounded-md bg-blue-50 text-blue-900 border border-blue-200">
        <p className="text-sm">
          Share your unique link and earn commission when referrals purchase.
          Generate your code if you don’t have one yet, then copy your link and
          share it anywhere.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Affiliate Link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {!code ? (
            <Button onClick={() => register()} disabled={isPending}>
              {isPending ? "Registering…" : "Generate Affiliate Code"}
            </Button>
          ) : (
            <div className="space-y-2">
              <Input readOnly value={link} />
              <Button onClick={() => navigator.clipboard.writeText(link)}>
                Copy Link
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Referrals</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {data?.referrals ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Clicks</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {data?.clicks ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Earnings</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            ₱{(data?.earnings ?? 0).toFixed(2)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AffiliateDashboard;

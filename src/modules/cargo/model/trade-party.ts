import { fakerFor } from '../../passengers/model/passenger-name';

export type TradeParties = {
  shipper: () => string;
  consignee: () => string;
};

export function tradePartyFactory(
  shipperLocale: string,
  consigneeLocale: string,
): TradeParties {
  const shipperFaker = fakerFor(shipperLocale);
  const consigneeFaker = fakerFor(consigneeLocale);

  return {
    shipper: () => shipperFaker.company.name(),
    consignee: () => consigneeFaker.company.name(),
  };
}

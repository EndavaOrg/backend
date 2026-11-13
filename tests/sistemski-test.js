// Sistemski testi za AvtoPrimerjalnik (k6)
//
// En scenarij (uporabnik išče avto), trije profili obremenitve:
//   TEST_TYPE=load    obremenitveni test  (20 sočasnih uporabnikov, 4,5 min)
//   TEST_TYPE=stress  stresni test        (do 150 uporabnikov, 8 min)
//   TEST_TYPE=spike   konični test        (nenaden skok s 5 na 100 uporabnikov)
//   TEST_TYPE=smoke   kratek preizkus, da skripta in strežnik delujeta (1 uporabnik, 30 s)
//
// Zagon (primer):
//   k6 run -e TEST_TYPE=load -e BASE_URL=http://localhost:5000 sistemski-test.js

import http from 'k6/http';
import { check, sleep, fail } from 'k6';

const BASE_URL = (__ENV.BASE_URL || 'http://localhost:5000').replace(/\/$/, '');
const TEST_TYPE = __ENV.TEST_TYPE || 'smoke';

// Profili obremenitve: število virtualnih uporabnikov (VU) skozi čas.
const PROFILES = {
  smoke: [
    { duration: '1s', target: 1 },
    { duration: '30s', target: 1 },
  ],
  load: [
    { duration: '1m', target: 20 },  // postopno naraščanje
    { duration: '3m', target: 20 },  // stalna obremenitev
    { duration: '30s', target: 0 },  // upadanje
  ],
  stress: [
    { duration: '1m', target: 20 },
    { duration: '2m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '2m', target: 150 },
    { duration: '1m', target: 0 },   // ali se sistem po obremenitvi opomore
  ],
  spike: [
    { duration: '30s', target: 5 },   // normalen promet
    { duration: '10s', target: 100 }, // nenaden skok
    { duration: '1m', target: 100 },  // vrh
    { duration: '10s', target: 5 },   // padec nazaj
    { duration: '1m', target: 5 },    // okrevanje
    { duration: '10s', target: 0 },
  ],
};

// Kriteriji sprejemljivosti. Ko je kriterij kršen, k6 test označi kot neuspešen (izhodna koda 99).
const THRESHOLDS = {
  smoke: {
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
  },
  load: {
    http_req_failed: ['rate<0.01'],                         // manj kot 1 % neuspešnih zahtev
    checks: ['rate>0.99'],
    'http_req_duration{name:znamke}': ['p(95)<500'],        // seznam znamk
    'http_req_duration{name:iskanje}': ['p(95)<1500'],      // iskanje s filtri
    'http_req_duration{name:najnovejsi}': ['p(95)<1000'],   // 12 najnovejših (priporočila)
    'http_req_duration{name:stetje_vseh}': ['p(95)<3000'],  // število vseh oglasov (začetna stran)
  },
  stress: {
    http_req_failed: ['rate<0.05'],                         // do 5 % napak še sprejemljivo
    'http_req_duration{name:iskanje}': ['p(95)<5000'],
  },
  spike: {
    http_req_failed: ['rate<0.05'],
    'http_req_duration{name:iskanje}': ['p(95)<3000'],
  },
};

if (!PROFILES[TEST_TYPE]) {
  throw new Error(`Neznan TEST_TYPE "${TEST_TYPE}". Možnosti: ${Object.keys(PROFILES).join(', ')}`);
}

export const options = {
  scenarios: {
    iskanje_avtomobila: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: PROFILES[TEST_TYPE],
      gracefulRampDown: '10s',
    },
  },
  thresholds: THRESHOLDS[TEST_TYPE],
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'max'],
  tags: { test_type: TEST_TYPE },
};

const randomItem = (list) => list[Math.floor(Math.random() * list.length)];
const think = () => sleep(1 + Math.random() * 2); // uporabnik "razmišlja" 1–3 s

// Pred testom: preveri, da strežnik deluje, in pripravi znamke za iskanje.
export function setup() {
  const res = http.get(`${BASE_URL}/api/cars/carquery/makes`, { timeout: '90s' }); // Render se lahko zbuja do 1 min
  if (res.status !== 200) {
    fail(`Strežnik ${BASE_URL} ne deluje (status ${res.status}). Zaženi backend in poskusi znova.`);
  }
  const makes = (res.json('Makes') || []).map((m) => m.make_display).filter(Boolean);
  if (makes.length === 0) fail('Seznam znamk je prazen – v bazi ni avtomobilov.');
  return { makes: makes.slice(0, 20) };
}

// En prehod = en uporabnik, ki odpre začetno stran in poišče avto.
export default function (data) {
  // 1. Začetna stran: seznam znamk, število vseh oglasov na gumbu, najnovejši oglasi
  const makesRes = http.get(`${BASE_URL}/api/cars/carquery/makes`, { tags: { name: 'znamke' } });
  check(makesRes, {
    'znamke: status 200': (r) => r.status === 200,
    'znamke: seznam ni prazen': (r) => (r.json('Makes') || []).length > 0,
  });

  const countRes = http.get(`${BASE_URL}/api/cars?`, { tags: { name: 'stetje_vseh' } });
  check(countRes, { 'štetje: status 200': (r) => r.status === 200 });

  const latestRes = http.get(`${BASE_URL}/api/cars?limit=12&sort=-_id`, { tags: { name: 'najnovejsi' } });
  check(latestRes, {
    'najnovejši: status 200': (r) => r.status === 200,
    'najnovejši: največ 12 oglasov': (r) => Array.isArray(r.json()) && r.json().length <= 12,
  });

  think();

  // 2. Iskanje s filtri (enako kot obrazec: znamka, letnik od 2015, cena do 20.000 €)
  const make = randomItem(data.makes);
  const query = `make=${encodeURIComponent(make)}&yearFrom=2015&first_registration=2015&priceTo=20000`;
  const searchRes = http.get(`${BASE_URL}/api/cars?${query}`, { tags: { name: 'iskanje' } });
  check(searchRes, {
    'iskanje: status 200': (r) => r.status === 200,
    'iskanje: odgovor je seznam': (r) => Array.isArray(r.json()),
  });

  think();

  // 3. Preklop na zavihek Motorji
  const motoRes = http.get(`${BASE_URL}/api/motorcycles/makes`, { tags: { name: 'znamke_motorjev' } });
  check(motoRes, { 'motorji: status 200': (r) => r.status === 200 });

  think();
}

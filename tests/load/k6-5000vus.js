import http from 'k6/http'; import { check } from 'k6';
export const options = { stages: [{ duration: '2m', target: 5000 }, { duration: '5m', target: 5000 }, { duration: '1m', target: 0 }],
  thresholds: { http_req_duration: ['p(95)<150'] } };
export default function () { check(http.get(`${__ENV.BASE_URL}/api/courses`), { ok: r => r.status === 200 || r.status === 401 }); }

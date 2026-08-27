/* 생성물 — tools/build.js 가 만듭니다. 직접 고치지 마세요.
   cases.html 의 필터·검색이 쓰는 목록 전용 데이터입니다.
   정렬은 빌드 시점에 이미 적용되어 있습니다 (대표사례 → 최신순 → 시공전 사진 가중치). */
'use strict';
const CASE_INDEX = [
 {
  "id": 1,
  "slug": "seogwipo-rotary-lane-delineator-replacement",
  "title": "서귀포시 로터리 차선규제봉 교체",
  "region": "서귀포시",
  "regionDetail": "치유의 숲 입구 로터리",
  "facilityType": "차선규제봉(시선유도봉)",
  "customerType": "관공서",
  "customerLabel": "서귀포시청",
  "primaryService": "road-traffic",
  "relatedServices": [],
  "workType": [
   "교체",
   "설치"
  ],
  "excerpt": "로터리는 진입 차량과 진출 차량이 같은 지점에서 동시에 발생하는 구간입니다. 이곳의 기존 규제봉이 제 기능을 못 하면 중앙선 침범과 불법 유",
  "representative": "after-01.jpg",
  "hasBefore": true,
  "tags": [
   "제주 차선규제봉",
   "서귀포 차선규제봉 교체",
   "제주 시선유도봉",
   "로터리 안전시설",
   "차선규제봉 철거 재설치"
  ]
 },
 {
  "id": 6,
  "slug": "jeju-exit-warning-light-mirror-sensor",
  "title": "제주 진출입로 출차주의등 설치 (미러센서·경광등)",
  "region": null,
  "regionDetail": "건물 진출입로",
  "facilityType": "출차주의등",
  "customerType": null,
  "customerLabel": null,
  "primaryService": "road-traffic",
  "relatedServices": [
   "pedestrian-life"
  ],
  "workType": [
   "설치"
  ],
  "excerpt": "진출입로는 건물에서 나오는 차량과 보도를 지나는 보행자가 만나는 지점입니다. 차량이 나오는 것을 보행자가 미리 알 수 없으면, 서로를 발견하",
  "representative": "after-02.jpg",
  "hasBefore": true,
  "tags": [
   "제주 출차주의등",
   "출차주의등 설치",
   "미러센서 경광등",
   "주차장 보행자 안전",
   "진출입로 안전시설"
  ]
 },
 {
  "id": 9,
  "slug": "road-kerb-realignment-asphalt-restoration",
  "title": "단지 내 도로 경계석 철거·재설치 및 아스콘 포장 복구",
  "region": null,
  "regionDetail": "단지 내 도로",
  "facilityType": "도로 경계석 / 아스콘 포장",
  "customerType": null,
  "customerLabel": null,
  "primaryService": "road-traffic",
  "relatedServices": [
   "public-maintenance"
  ],
  "workType": [
   "교체",
   "개선"
  ],
  "excerpt": "단지 내 도로의 선형이 좁아 차량이 경계석을 밟고 지나가는 일이 반복되고 있었습니다. 경계석이 계속 하중을 받으면 파손과 이탈로 이어지고, ",
  "representative": "after-02.jpg",
  "hasBefore": true,
  "tags": [
   "제주 경계석 재설치",
   "경계석 선형 조정",
   "아스콘 포장 복구",
   "단지 내 도로 안전",
   "도로복구용 아스콘"
  ]
 },
 {
  "id": 2,
  "slug": "school-entrance-ramp-plate-installation",
  "title": "학교 출입구 경사로 진입판 설치",
  "region": null,
  "regionDetail": null,
  "facilityType": "경사로 진입판 (차량 진입판 U형)",
  "customerType": "학교",
  "customerLabel": "제주 소재 초등학교",
  "primaryService": "school-child",
  "relatedServices": [
   "pedestrian-life"
  ],
  "workType": [
   "설치"
  ],
  "excerpt": "보도와 도로 사이에 단차가 있어 통행이 끊기는 구조였습니다. 아이들뿐 아니라 유모차와 휠체어가 지날 때 걸림이 생기고, 차량이 넘어갈 때는 ",
  "representative": "after-01.jpg",
  "hasBefore": true,
  "tags": [
   "학교 경사로 진입판",
   "차량 진입판 U형",
   "단차 해소",
   "제주 학교 안전시설",
   "보도 단차"
  ]
 },
 {
  "id": 3,
  "slug": "seogwipo-school-route-delineator-post",
  "title": "서귀포시 초등학교 통학로 시선유도봉 설치",
  "region": "서귀포시",
  "regionDetail": "초등학교 통학로",
  "facilityType": "시선유도봉",
  "customerType": "학교",
  "customerLabel": "서귀포시 소재 초등학교",
  "primaryService": "school-child",
  "relatedServices": [
   "road-traffic"
  ],
  "workType": [
   "설치"
  ],
  "excerpt": "현장을 처음 확인했을 때 차량과 보행자의 동선이 자연스럽게 섞일 수 있는 구조였습니다. 어린이가 매일 이용하는 통학로였기 때문에, 사고가 난",
  "representative": "after-01.jpg",
  "hasBefore": true,
  "tags": [
   "제주 시선유도봉",
   "서귀포 통학로 안전시설",
   "학교 시선유도봉",
   "통학로 동선 분리",
   "제주 학교 안전시설"
  ]
 },
 {
  "id": 4,
  "slug": "school-drainage-heavy-duty-grating-replacement",
  "title": "학교 배수로 중하중 그레이팅 교체",
  "region": null,
  "regionDetail": null,
  "facilityType": "중하중 그레이팅",
  "customerType": "학교",
  "customerLabel": "제주 소재 초등학교",
  "primaryService": "pedestrian-life",
  "relatedServices": [
   "school-child",
   "public-maintenance"
  ],
  "workType": [
   "교체",
   "보수"
  ],
  "excerpt": "현장을 확인해 보니 바닥 콘크리트에 균열이 여러 곳 있었고, 배수로 주변이 파손·열화된 상태였습니다. 기존 그레이팅은 이 구간에 걸리는 하중",
  "representative": "after-01.jpg",
  "hasBefore": true,
  "tags": [
   "제주 배수로 그레이팅",
   "중하중 그레이팅",
   "학교 배수로 교체",
   "그레이팅 교체",
   "학교 안전시설"
  ]
 },
 {
  "id": 8,
  "slug": "jeju-parking-reflective-tape-delineator-post",
  "title": "제주 주차장 반사테이프·시선유도봉 설치",
  "region": null,
  "regionDetail": "제주도 내 주차장",
  "facilityType": "고휘도 반사테이프 / 시선유도봉 / 반사 경고도색",
  "customerType": null,
  "customerLabel": null,
  "primaryService": "road-traffic",
  "relatedServices": [
   "pedestrian-life"
  ],
  "workType": [
   "설치",
   "개선"
  ],
  "excerpt": "주차면 중앙에 기둥이 서 있어 차량이 드나들 때 측면 접촉 위험이 컸습니다. 보행자와 차량의 동선이 겹치는 구간이 있었고, 돌출된 경계 구조",
  "representative": "after-05.jpg",
  "hasBefore": true,
  "tags": [
   "제주 반사테이프",
   "주차장 기둥 보호",
   "제주 시선유도봉",
   "반사 경고도색",
   "주차장 안전시설"
  ]
 },
 {
  "id": 5,
  "slug": "stainless-folding-gate-rail-type",
  "title": "레일형 스텐 자바라 대문 설치",
  "region": null,
  "regionDetail": null,
  "facilityType": "스텐 자바라 대문 (레일형)",
  "customerType": null,
  "customerLabel": null,
  "primaryService": "metal-fabrication",
  "relatedServices": [],
  "workType": [
   "설치"
  ],
  "excerpt": "차량 통행이 잦고 대문의 직선 주행성이 중요한 진입로였습니다. 자바라 대문은 길어질수록 휘어짐이 생기기 쉽고, 강풍이나 경사 조건에서는 개폐",
  "representative": "after-02.jpg",
  "hasBefore": false,
  "tags": [
   "제주 스텐 자바라 대문",
   "레일형 자바라 대문",
   "STS304 대문",
   "스테인리스 대문 설치",
   "제주 금속 시설물"
  ]
 }
];

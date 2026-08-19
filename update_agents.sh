#!/bin/bash
sed -i '42,115c\
const AGENT_PERSONAS = [\
  {\
    id: "archivist",\
    name: "ARCHIVIST",\
    role: "Evaluate if the extracted logic is the truest historical representation of the stub'\''s PURPOSE. Reject name collisions and dashboard impostors.",\
    bias: "favors authentic historical lineage",\
  },\
  {\
    id: "security",\
    name: "SECURITY",\
    role: "Evaluate for unredacted secrets, exposed tokens, or unsafe autonomous loops. Reject any code that could create vulnerabilities.",\
    bias: "favors strict security and sanitization",\
  },\
  {\
    id: "pragmatist",\
    name: "PRAGMATIST",\
    role: "Evaluate against the Stasis Trap. Reject bloated, over-engineered, or duplicated logic that fails to provide a concrete behavioral update.",\
    bias: "favors highly functional and concrete updates over theoretical bloat",\
  }\
];' src/app/api/evolution/debate/route.ts

export type Question = {
  q: string;
  opts: string[];
  a: number;
};

export const QUESTIONS: Question[] = [
  {
    q: "Which protocol operates at the transport layer (L4) of the OSI model?",
    opts: ["HTTP", "TCP", "ARP", "ICMP"],
    a: 1,
  },
  {
    q: "What does <code>chmod 755</code> mean for a file's permissions?",
    opts: [
      "rwx for owner; r-x for group and others",
      "rwx for everyone",
      "r-- for owner; rwx for group; --x for others",
      "rwx for owner; rw- for group; r-- for others",
    ],
    a: 0,
  },
  {
    q: "Which HTTP status code indicates the resource was not found?",
    opts: ["301", "401", "403", "404"],
    a: 3,
  },
  {
    q: "In Big-O, what is the average-case time complexity of a hash table lookup?",
    opts: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    a: 0,
  },
  {
    q: "Which command shows the routing table on a Linux machine?",
    opts: [
      "<code>ifconfig</code>",
      "<code>ip route</code>",
      "<code>netstat -i</code>",
      "<code>traceroute</code>",
    ],
    a: 1,
  },
  {
    q: "What does SQL <code>JOIN ... ON</code> default to if you omit the join type?",
    opts: ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "CROSS JOIN"],
    a: 2,
  },
  {
    q: "Which of these is NOT a valid IPv4 address?",
    opts: ["10.0.0.1", "172.16.255.254", "192.168.1.1", "256.100.50.25"],
    a: 3,
  },
  {
    q: "Git: which command rewrites history of the current branch onto another?",
    opts: [
      "<code>git merge</code>",
      "<code>git rebase</code>",
      "<code>git cherry-pick</code>",
      "<code>git reset</code>",
    ],
    a: 1,
  },
  {
    q: "What kind of attack does parameterized SQL primarily prevent?",
    opts: ["Cross-site scripting (XSS)", "SQL injection", "CSRF", "DDoS"],
    a: 1,
  },
  {
    q: "Which port does HTTPS use by default?",
    opts: ["21", "22", "80", "443"],
    a: 3,
  },
];

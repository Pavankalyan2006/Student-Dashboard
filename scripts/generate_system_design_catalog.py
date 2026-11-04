#!/usr/bin/env python3
import json
import os

# Script to assemble the complete 69 lessons and 25 challenges for System Design Lab

print("Generating System Design Master Catalog...")

# Define curriculum levels
LEVEL_INFOS = [
    {
        "level": 1,
        "name": "Foundations",
        "tagline": "Master Core Architecture Principles & Capacity Planning",
        "description": "Learn the foundational grammar of software engineering: functional and non-functional requirements, availability SLAs, fault tolerance, and back-of-the-envelope estimation."
    },
    {
        "level": 2,
        "name": "Core Components",
        "tagline": "The Essential Building Blocks of Modern Web Architecture",
        "description": "Deep-dive into load balancers, caching tiers, relational vs NoSQL databases, sharding, replication, asynchronous message queues, and API gateways."
    },
    {
        "level": 3,
        "name": "Distributed Systems",
        "tagline": "Reliability, Consistency & Concurrency at Planet Scale",
        "description": "Master the CAP theorem, eventual consistency, distributed transactions, idempotency, circuit breakers, rate limiters, consensus (Raft/Paxos), and observability."
    },
    {
        "level": 4,
        "name": "Advanced Architecture",
        "tagline": "Enterprise Microservices, Event Sourcing & Real-Time Engines",
        "description": "Explore microservices vs monoliths, CQRS, Sagas, streaming architectures, multi-region active-active deployments, zero-trust security, and multi-tenant isolation."
    },
    {
        "level": 5,
        "name": "Interview Preparation",
        "tagline": "The 10-Step Framework to Ace FAANG/MNC System Design Rounds",
        "description": "Structured execution framework: clarifying scope, scale math, API contracts, schema modeling, high-level topology, bottleneck mitigation, and trade-off defense."
    }
]

print("Levels configured:", len(LEVEL_INFOS))

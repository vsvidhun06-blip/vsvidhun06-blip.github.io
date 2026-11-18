import type { Metadata } from "next";
import { CaseBody, CaseHeader, CaseSection, KeyList, NextProject, Prose } from "@/components/case";
import EcommerceExplorer from "@/components/ecommerce-explorer";
import { Evidence } from "@/components/ui";
import { ecommerceBench } from "@/content/results";

export const metadata: Metadata = {
  title: "Event-driven e-commerce backend",
  description:
    "Seven Spring Boot applications with a choreographed order and inventory saga over Kafka, Resilience4j protection, Redis caching and rate limiting, tracing, and k6 measurements.",
  alternates: { canonical: "/work/ecommerce-microservices/" },
};

const toc = [
  { id: "problem", label: "The problem" },
  { id: "explore", label: "Explore the system" },
  { id: "correctness", label: "Making the saga safe" },
  { id: "results", label: "Measured behaviour" },
  { id: "bugs", label: "Bugs found on the way" },
  { id: "limits", label: "What is not done" },
];

function Table({ title, rows, note }: { title: string; rows: { k: string; v: string }[]; note?: string }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-2)] p-5 sm:p-6">
      <p className="eyebrow">{title}</p>
      <dl className="mt-4 divide-y divide-[var(--line)]">
        {rows.map((r) => (
          <div key={r.k} className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
            <dt className="text-[var(--fg-2)]">{r.k}</dt>
            <dd className="tabular text-right font-mono text-[13px] text-[var(--fg)]">{r.v}</dd>
          </div>
        ))}
      </dl>
      {note && <p className="mt-4 text-[12.5px] leading-relaxed text-[var(--fg-3)]">{note}</p>}
    </div>
  );
}

export default function Page() {
  return (
    <article>
      <CaseHeader
        kicker="E-commerce backend"
        title={
          <>
            Orders, stock, <em>and failure</em>
          </>
        }
        lede={
          <p>
            An event-driven e-commerce backend built to practise the parts of distributed systems that tutorials skip:
            what happens when a message arrives twice, a dependency goes down, or a cache key goes cold under load.
          </p>
        }
        meta={[
          { label: "Role", value: "Sole developer" },
          { label: "Timeline", value: "Feb 2026 to Jun 2026" },
          { label: "Type", value: "Personal project, runs locally with Docker Compose" },
          { label: "Stack", value: "Java 17, Spring Boot 3.2, Kafka, PostgreSQL, Redis, Resilience4j, Eureka, Zipkin, k6" },
        ]}
        links={[{ label: "Source on GitHub", href: "https://github.com/vsvidhun06-blip/eCOMMERCE-MICROSERVICES" }]}
      />
      <CaseBody toc={toc}>
        <CaseSection id="problem" n="01" title="One order, three services">
          <Prose>
            <p>
              Placing an order touches the order service, the product catalogue and inventory. Each service owns its
              own PostgreSQL database, so there is no shared transaction to lean on. If inventory runs out after the
              order is written, something has to undo the order; if a confirmed order is cancelled, something has to
              give the stock back.
            </p>
            <p>
              I used a choreographed saga: services react to each other&apos;s events on Kafka, and each step has a
              compensating action. Around it sit the protections a real service needs: a circuit breaker on the one
              synchronous call, a dead-letter path for bad messages, a cache that does not stampede, and a rate limiter.
            </p>
          </Prose>
        </CaseSection>

        <CaseSection id="explore" n="02" title="Explore the system" wide>
          <div className="mb-8 max-w-3xl">
            <Prose>
              <p>
                Step through four scenarios to see which services and events take part, and click a component to read
                what it does. Seven Spring Boot applications in total: the gateway, Eureka and five domain services.
              </p>
            </Prose>
          </div>
          <EcommerceExplorer />
        </CaseSection>

        <CaseSection id="correctness" n="03" title="Making the saga safe">
          <KeyList
            items={[
              { t: "Idempotent inventory", d: "Every order's outcome is stored in a reservation row keyed uniquely by orderId. A redelivered order-created replays the stored outcome instead of reserving twice; a duplicate cancel on a released reservation does nothing." },
              { t: "Idempotent orders", d: "State transitions only fire from PENDING, so a duplicate reserved or failed event is a no-op." },
              { t: "All or nothing", d: "Inventory reserves every line or none. A partial reservation is rolled back before inventory-failed is published." },
              { t: "No overselling", d: "The stock ledger has an optimistic lock, and stock is split into available and reserved buckets so a reservation can be reversed exactly." },
              { t: "Poison messages", d: "Consumers wrap deserialisers so a bad payload becomes a handled error. Failing records are retried twice, one second apart, then routed to a .DLT topic." },
              { t: "Stampede protection", d: "On a cache miss, one reader takes a Redis lock with a per-holder token, re-checks the cache, loads and repopulates. Others wait briefly, or read the database if the holder is slow." },
            ]}
          />
        </CaseSection>

        <CaseSection id="results" n="04" title="Measured behaviour" wide>
          <div className="max-w-3xl">
            <Prose>
              <p>
                k6 runs on one machine ({ecommerceBench.environment}). The gateway limits each client IP to 10 requests
                per second, which would turn a single-host load test into a test of the limiter, so the heavy tests hit
                services directly and the limiter is measured on its own. Single-host numbers say how each layer
                behaves, not how the system scales.
              </p>
            </Prose>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Table title="Product reads, cached" rows={ecommerceBench.productRead} note="One hot key, warmed first. This measures the cache path, not database reads." />
            <Table title="Order creation, product service healthy" rows={ecommerceBench.orderCreate} note="The 98 dropped iterations were k6 running out of virtual users, not server errors." />
            <Table title="Forced circuit-breaker trip" rows={ecommerceBench.breakerTrip} note="After product-service restarted, the breaker did not close on its own. See below." />
            <Table title="Gateway rate limiter" rows={ecommerceBench.rateLimit} />
          </div>
          <div className="mt-4">
            <Evidence kind="measured">{ecommerceBench.source}</Evidence>
          </div>
        </CaseSection>

        <CaseSection id="bugs" n="05" title="Bugs found on the way">
          <Prose>
            <p>Getting the benchmark run to work at all surfaced two real bugs on the saga path.</p>
          </Prose>
          <div className="mt-8">
            <KeyList
              items={[
                {
                  t: "A bean that vanished",
                  d: (
                    <>
                      Adding a <code>KafkaTemplate&lt;String, byte[]&gt;</code> for the dead-letter path made Spring Boot
                      skip its default <code>KafkaTemplate&lt;String, Object&gt;</code>, because the auto-configuration
                      condition matches the raw type and ignores generics. Order and inventory services failed to start.
                      The fix declares the JSON template explicitly.
                    </>
                  ),
                },
                {
                  t: "A null from a builder",
                  d: (
                    <>
                      Lombok&apos;s <code>@Builder</code> ignores field initialisers unless marked{" "}
                      <code>@Builder.Default</code>, so an order&apos;s item list was null and every order creation
                      returned 500. One annotation fixed it.
                    </>
                  ),
                },
              ]}
            />
          </div>
        </CaseSection>

        <CaseSection id="limits" n="06" title="What is not done">
          <KeyList
            items={[
              { t: "Breaker recovery", d: "After product-service restarted with a new container IP, order-service's load balancer cache kept the old instance, so every half-open probe failed and the breaker re-opened for minutes. Restarting order-service fixed it. I documented it rather than fixing it; the follow-up is a shorter cache TTL or eager refresh." },
              { t: "Dead-letter path", d: "Wired and configured, but not re-captured in the latest benchmark run." },
              { t: "Notifications", d: "The notification service listens for user-created events that nothing publishes yet." },
              { t: "Deployment", d: "Runs locally with Docker Compose. It has not been deployed to a cloud provider or Kubernetes." },
              { t: "Public README", d: "The top of the repository README predates the Kafka saga and still describes an older design. The architecture and benchmark docs are current." },
            ]}
          />
        </CaseSection>
      </CaseBody>
      <NextProject current="ecommerce-microservices" />
    </article>
  );
}

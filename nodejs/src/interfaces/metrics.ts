import {BSBError} from "../base";

export interface IPluginMetrics {
  /**
   * Creates a counter metric.
   * A Counter is a metric that represents a monotonically increasing value.
   * It is used to measure the cumulative count of an event that increases
   * over time and resets to zero only when the process restarts.
   *
   * @remarks
   * Use Cases:
   *
   * Event Counting: Counting the number of requests received, errors encountered, or messages processed.
   * Work Done: Measuring the total number of bytes read or written, tasks completed, or jobs processed.
   * Characteristics:
   *
   * Monotonic: Counters can only increase or reset. They cannot decrease.
   * Sum: The focus is on the total accumulated value over time.
   * Example: A Counter can be used to count the number of HTTP requests received by a server.
   *
   * @param name - The name of the counter metric
   * @param description - A description of the counter metric
   * @param help - More information about the counter metric
   * @param labels - Optional labels to associate with the counter metric
   * @returns A Counter object that can be used to update the counter metric
   *
   * @example
   * ```ts
   * let counter = this.metrics.createCounter("my-counter", "A counter metric");
   * counter.inc(); // Increment the counter by 1
   * counter.inc(1); // Increment the counter by 1
   * counter.inc(10); // Increment the counter by 10
   * ```
   */
  createCounter<LABELS extends string | undefined>(name: string, description: string, help: string, labels?: LABELS[]): Counter<LABELS>;

  /**
   * Creates a gauge metric.
   * A  Gauge is a metric that represents a value that can go up and down.
   * It measures the current value of a particular data point at a specific moment in time.
   *
   * @remarks
   * Use Cases:
   *
   * Resource Levels: Monitoring CPU usage, memory consumption, or disk space.
   * Temperature or Pressure: Tracking real-time sensor readings.
   * Current State: Measuring the current number of active users or open connections.
   * Characteristics:
   *
   * Variable: Gauges can increase and decrease over time.
   * Instantaneous: Captures a snapshot of a value at a particular time.
   * Example: A Gauge can be used to measure the current temperature of a system or the current memory usage of an application.
   *
   * @param name - The name of the gauge metric
   * @param description - A description of the gauge metric
   * @param help - More information about the gauge metric
   * @param labels - Optional labels to associate with the gauge metric
   * @returns A Gauge object that can be used to update the gauge metric
   *
   * @example
   * ```ts
   * let gauge = this.metrics.createGauge("my-gauge", "A gauge metric");
   * gauge.set(10); // Set the gauge to 10
   * gauge.set(20); // Set the gauge to 20
   * gauge.set(30); // Set the gauge to 30  
   * gauge.increment(); // Increment the gauge by 1
   * gauge.increment(10); // Increment the gauge by 10
   * gauge.decrement(); // Decrement the gauge by 1
   * gauge.decrement(10); // Decrement the gauge by 10
   * ```
   */
  createGauge<LABELS extends string | undefined>(name: string, description: string, help: string, labels?: LABELS[]): Gauge<LABELS>;

  /**
   * Creates a histogram metric.
   * A Histogram is a metric that collects data samples and counts them in predefined buckets.
   * It provides statistical distribution of values over time, capturing not just the
   * total sum but also the distribution of values.
   *
   * @remarks
   * Use Cases:
   *
   * Event Distribution: Measuring the distribution of events received by a system, such as the number of requests per second or the distribution of response times.
   * Work Done: Measuring the distribution of bytes read or written, tasks completed, or jobs processed.
   * Characteristics:
   *
   * Monotonic: Histograms can only increase or reset. They cannot decrease.
   * Sum: The focus is on the total accumulated value over time.
   * Example: A Histogram can be used to measure the distribution of response times for a web server.
   *
   * @param name - The name of the histogram metric
   * @param description - A description of the histogram metric
   * @param help - More information about the histogram metric
   * @param boundaries - Optional boundaries for the histogram metric
   * @param labels - Optional labels to associate with the histogram metric
   * @returns A Histogram object that can be used to update the histogram metric
   *
   * @example
   * ```ts
   * let histogram = this.metrics.createHistogram("my-histogram", "A histogram metric");
   * histogram.record(10); // Record the value 10 in the histogram
   * histogram.record(20); // Record the value 20 in the histogram
   * histogram.record(30); // Record the value 30 in the histogram
   * ```
   */
  createHistogram<LABELS extends string | undefined>(name: string, description: string, help: string, boundaries?: number[], labels?: LABELS[]): Histogram<LABELS>;

  /**
   * Creates a trace metric.
   * A Trace is a metric that represents a sequence of events or operations.
   * It provides a hierarchical view of the execution of a system or application.
   *
   * @remarks
   * Use Cases:
   *
   * Event Tracing: Tracing the execution of a system or application, capturing the sequence of events and operations.
   * Work Done: Tracing the execution of a system or application, capturing the sequence of tasks and jobs.
   * Characteristics:
   *
   * Hierarchical: Traces can be nested to provide a hierarchical view of the execution.
   * Example: A Trace can be used to trace the execution of a system or application, capturing the sequence of events and operations.
   *
   * @param parentId - Optional parent ID for the trace metric
   * @returns A Trace object that can be used to update the trace metric
   *
   * @example
   * ```ts
   * let trace = this.metrics.createTrace();
   * let spanId = trace.startSpan("span-1"); // Start a new span with the name "span-1"
   * trace.startSpan("span-2", spanId); // Start a new span with the name "span-2" and parent span ID
   * trace.startSpan("span-3"); // Start a new span with the name "span-3" and no parent span ID
   * trace.endSpan(spanId); // End the current span
   * ```
   * @example
   * ```ts
   * let trace = this.metrics.createTrace();
   * let spanId = trace.startSpan("span-1", undefined, {"key": "value"}); // Start a new span with the name "span-1" and no parent span ID, and with attributes
   * trace.startSpan("span-2", spanId, {"key": "value"}); // Start a new span with the name "span-2" and parent span ID, and with attributes
   * trace.startSpan("span-3", undefined, {"key": "value"}); // Start a new span with the name "span-3" and no parent span ID, and with attributes
   * trace.endSpan(spanId, {"key": "value"}); // End the current span with attributes
   * trace.errorSpan(spanId, new Error("Error message"), {"key": "value"}); // Record an error in the current span with attributes
   * ```
   */
  createTrace(parentId?: string): Trace;

  /***
   * Create Timer
   * A Timer is a metric that measures the time taken to execute a block of code.
   * It provides a simple way to measure the time taken to execute a block of code.
   *
   * @remarks
   * Use Cases:
   *
   * Event Timing: Measuring the time taken to execute a block of code.
   * Work Done: Measuring the time taken to execute a block of code.
   * Characteristics:
   *
   * Monotonic: Timers can only increase or reset. They cannot decrease.
   * Sum: The focus is on the total accumulated value over time.
   * Example: A Timer can be used to measure the time taken to execute a block of code.
   *
   * @returns A Timer object that can be used to update the timer metric
   *
   * @example
   * ```ts
   * let timer = this.metrics.createTimer(); // Start the timer
   * // Do some work
   * let elapsedTime = timer.stop(); // Stop the timer and get the elapsed time in nanoseconds
   * ```
   */
  createTimer(): Timer
}

export interface Timer {
  /**
   * Stops the timer
   * @return The elapsed time in milliseconds
   */
  stop(): number
}

export interface Trace {
  /**
   * This trace ID.
   */
  id: Readonly<string>;

  /**
   * Starts a new span with the specified name.
   *
   * @param name - The name of the span
   * @param parentSpanId - Optional parent span ID
   * @param attributes - Optional attributes to associate with the span
   */
  createSpan(name: string, parentSpanId?: string, attributes?: Record<string, string>): Span;

  /**
   * Ends the current trace.
   *
   * @param attributes - Optional attributes to associate with the trace
   */
  end(attributes?: Record<string, string>): void;
}

export interface Span {
  /**
   * This span ID.
   */
  id: Readonly<string>;
  /**
   * This trace ID.
   */
  traceId: Readonly<string>;

  /**
   * Ends the current span.
   *
   * @param spanId - The ID of the span to end
   * @param attributes - Optional attributes to associate with the span
   */
  end(attributes?: Record<string, string>): void;

  /**
   * Records an error in the current span.
   *
   * @param spanId - The ID of the span to record the error in
   * @param error - The error to record
   * @param attributes - Optional labels to associate with the span
   */
  error(error: BSBError<any> | Error, attributes?: Record<string, string>): void;
}

export interface Counter<LABELS extends string | undefined = undefined> {
  /**
   * Adds a value to the counter metric.
   *
   * @param value - The value to add to the counter metric
   * @param labels - Optional labels to associate with the counter metric
   */
  inc(value?: number, labels?: LABELS extends string ? Partial<Record<LABELS, string>> : never): void;
}

export interface Gauge<LABELS extends string | undefined = undefined> {
  /**
   * Sets the value of the gauge metric.
   *
   * @param value - The value to set the gauge metric
   * @param labels - Optional labels to associate with the gauge metric
   */
  set(value: number, labels?: LABELS extends string ? Partial<Record<LABELS, string>> : never): void;

  /**
   * Increments the value of the gauge metric by a specified amount.
   *
   * @param value - The amount to increment the gauge metric by
   * @param labels - Optional labels to associate with the gauge metric
   */
  increment(value?: number, labels?: LABELS extends string ? Partial<Record<LABELS, string>> : never): void;

  /**
   * Decrements the value of the gauge metric by a specified amount.
   *
   * @param value - The amount to decrement the gauge metric by
   * @param labels - Optional labels to associate with the gauge metric
   */
  decrement(value?: number, labels?: LABELS extends string ? Partial<Record<LABELS, string>> : never): void;
}

export interface Histogram<LABELS extends string | undefined = undefined> {
  /**
   * Records a value in the histogram metric.
   *
   * @param value - The value to record in the histogram metric
   * @param labels - Optional labels to associate with the histogram metric
   */
  record(value: number, labels?: LABELS extends string ? Partial<Record<LABELS, string>> : never): void;
}

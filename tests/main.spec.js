const { describe, it, beforeEach } = require('node:test');
const { strict, throws, equal } = require('node:assert');
const { performance } = require('node:perf_hooks')

const { getPerformance, main } = require('../src/index.js');

describe('performance', () => {
  it('get the performance with success', () => {
    const performanceData = getPerformance()

    strict(performanceData.total_time_bootstrap_node, performance.nodeTiming.bootstrapComplete)
    strict(performanceData.total_time_init_event_loop, performance.nodeTiming.bootstrapComplete)
  })
})

describe('main', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
  })

  it('throws an error when provider is not passed', () => {
    throws(main, {
      name: 'Error',
      message: 'Telemetry Provider was not passed',
    })
  })

  it('throws an error when provider not exists', () => {
    throws(() => main('grafana'), /Cannot find module/)
  })

  it('get the provider with success', () => {
    main('datadog')
  })

  it('when the NODE_ENV is development should log the performance attrs', (t) => {
    process.env.NODE_ENV = 'development'

    const tracker = t.mock.method(console, 'info')

    try {
      main('datadog')
    } catch (error) { }

    strict(tracker.mock.callCount(), 2)
  })

  const envs = ['production', 'test'];

  envs.map((env) =>
    it(`when the NODE_ENV is ${env} should NOT log the performance attrs`, (t) => {
      process.env.NODE_ENV = env

      const tracker = t.mock.method(console, 'info')

      try {
        main('datadog')
      } catch (error) { }

      equal(tracker.mock.callCount(), 0)
    })
  );
})
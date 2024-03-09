const { resolve } = require('node:path')
const { performance } = require('node:perf_hooks')
const { cwd } = require('node:process')

/**
 * @description Get the performance of application
 * @returns {{total_time_bootstrap_node: number, total_time_init_event_loop: number}}
 */
const getPerformance = () => {
  const totalTimeToBootstrap = performance.nodeTiming.bootstrapComplete
  const totalTimeToInitEventLoop = performance.nodeTiming.loopStart

  return {
    total_time_bootstrap_node: totalTimeToBootstrap,
    total_time_init_event_loop: totalTimeToInitEventLoop,
  }
}

/**
 * @typedef {'datadog'} TelemetryProvider
 */

/**
 * @param {TelemetryProvider} provider - The name of Telemetry Provider to send the data
 * @description The main function to get and process the performance
 */
const main = provider => {
  /**
   * @type TelemetryProvider
   */
  let telemetryProvider;

  if (!provider && !process.env.TELEMETRY_PROVIDER)
    throw new Error('Telemetry Provider was not passed');

  if (provider)
    telemetryProvider = provider
  else
    telemetryProvider = process.env.TELEMETRY_PROVIDER

  const performance = getPerformance();

  if (process.env.NODE_ENV === 'development') {
    console.info('The total time spend to bootstrap the nodejs:', performance.total_time_bootstrap_node)
    console.info('The total time spend to init the event loop:', performance.total_time_init_event_loop)
  }

  require(resolve(cwd(), 'src', 'providers', `${telemetryProvider}.js`))()

  return performance;
}

module.exports = { getPerformance, main };

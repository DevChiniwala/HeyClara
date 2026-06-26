import type { Channel, ChannelFactory } from "../types/channel";

const factories: ChannelFactory[] = [];
const started: Channel[] = [];

export function registerChannel(factory: ChannelFactory): void {
  factories.push(factory);
}

export function getFactories(): ChannelFactory[] {
  return factories;
}

export function trackStarted(channel: Channel): void {
  started.push(channel);
}

export function getStarted(): Channel[] {
  return [...started];
}

export function clearStarted(): void {
  started.length = 0;
}

export function getChannel(name: string): Channel | undefined {
  return started.find((c) => c.name === name);
}

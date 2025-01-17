import type { Handler } from 'hono';
import { namespaces } from '@/registry';
import { parse } from 'tldts';
import { Radar } from '@/types';

const radar: Radar = {};

for (const namespace in namespaces) {
    for (const path in namespaces[namespace].routes) {
        const realPath = `/${namespace}${path}`;
        const data = namespaces[namespace].routes[path];
        if (data.radar && data.radar.source) {
            const parsedDomain = parse(new URL('https://' + data.radar.source[0]).hostname);
            const subdomain = parsedDomain.subdomain || '.';
            const domain = parsedDomain.domain;
            if (domain) {
                if (!radar[domain]) {
                    radar[domain] = {
                        _name: namespaces[namespace].name,
                    };
                }
                if (!radar[domain][subdomain]) {
                    radar[domain][subdomain] = [];
                }
                radar[domain][subdomain].push({
                    title: data.name,
                    docs: `https://docs.rsshub.app/routes/${data.categories?.[0] || 'other'}`,
                    source: data.radar.source.map((source) => {
                        const sourceURL = new URL('https://' + source);
                        return sourceURL.pathname + sourceURL.search + sourceURL.hash;
                    }),
                    target: data.radar.target || realPath,
                });
            }
        }
    }
}

const handler: Handler = (ctx) => ctx.json(radar);

export default handler;

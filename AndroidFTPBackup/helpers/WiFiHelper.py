import logging
from builtins import len


class WiFiHelper:
    logger = logging.getLogger(__name__)

    @classmethod
    def get_connected_devices(cls, ip_range):
        cls.logger.info('Getting wifi connections on: {}'.format(ip_range))
        devices = cls.get_devices_by_nmap(ip_range)

        return devices

    @classmethod
    def get_ip_by_mac(cls, ip_range, mac):
        cls.logger.info('Getting wifi connection with MAC: {} on {}'.format(mac, ip_range))
        devices = cls.get_devices_by_nmap(ip_range)

        matched_entry = list(filter(lambda a: a['mac'] == mac, devices))
        if len(matched_entry) == 1:
            return matched_entry[0]['ip']

        cls.logger.warning('Wifi connection with MAC: {} on {} not found'.format(mac, ip_range))
        return 'Not Found'

    @classmethod
    def get_devices_by_nmap(cls, hosts):
        import nmap

        nm = nmap.PortScanner()
        nm.scan(hosts=hosts, arguments='-sP')

        hosts = []
        for x in nm.all_hosts():
            if 'mac' in nm[x]['addresses']:
                mac = nm[x]['addresses']['mac']
                host = dict(ip=x, mac=mac)
                if mac in nm[x]['vendor']:
                    host['vendor'] = nm[x]['vendor'][mac]
                hosts.append(host)

        return hosts

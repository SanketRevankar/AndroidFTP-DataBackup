import logging
import os
import uuid
import xml.etree.ElementTree as Et

import nmap


class WiFiHelper:
    logger = logging.getLogger(__name__)

    @classmethod
    def get_connected_devices(cls, ip):
        cls.logger.info('Getting wifi connections on: {}'.format(ip))
        uuid_ = uuid.uuid4().__str__()
        root = cls.start_nmap(ip, uuid_)

        devices = []
        for child in root:
            if child.tag == 'host':
                host = {}
                for element in child:
                    if element.tag == 'address':
                        if element.attrib['addrtype'] == 'ipv4':
                            host['ip'] = element.attrib['addr']
                        if element.attrib['addrtype'] == 'mac':
                            host['mac'] = element.attrib['addr']
                            if 'vendor' in element.attrib:
                                host['vendor'] = element.attrib['vendor']
                if 'mac' in host:
                    devices.append(host)

        os.remove(uuid_)

        return devices

    @classmethod
    def get_ip_by_mac(cls, hosts, mac):
        cls.logger.info('Getting wifi connection with MAC: {} on {}'.format(mac, hosts))
        uuid_ = uuid.uuid4().__str__()
        root = cls.start_nmap(hosts, uuid_)

        last_ip = ''
        for child in root:
            if child.tag == 'host':
                for c in child:
                    if c.tag == 'address':
                        if c.attrib['addrtype'] == 'ipv4':
                            last_ip = c.attrib['addr']
                        if c.attrib['addrtype'] == 'mac':
                            if mac == c.attrib['addr']:
                                cls.logger.info('Wifi connection with MAC: {} has IP: {}'.format(mac, last_ip))
                                os.remove(uuid_)
                                return last_ip

        os.remove(uuid_)

        cls.logger.warning('Wifi connection with MAC: {} on {} not found'.format(mac, hosts))
        return 'Not Found'

    @classmethod
    def start_nmap(cls, hosts, uuid_):
        nm = nmap.PortScanner()
        nm.scan(hosts=hosts, arguments='-sP --max-parallelism 200')
        nm_mxl = nm.get_nmap_last_output()
        file = open(uuid_, 'w')
        file.write(nm_mxl)
        file.close()
        tree = Et.parse(uuid_)
        return tree.getroot()

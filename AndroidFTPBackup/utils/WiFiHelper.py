import logging
import os
import xml.etree.ElementTree as Et

import nmap

from AndroidFTPBackup.constants import PyStrings as pS


class WiFiHelper:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.logger.info(pS.LOG_INIT.format(__name__))

    def get_wifi_connections(self, request):
        hosts = {}
        ip = request.GET.get(pS.IP)

        self.logger.info(pS.GET_WIFI_CONNECTIONS.format(ip))
        root = self.start_nmap(ip)

        n = 0
        for child in root:
            if child.tag == pS.HOST:
                for c in child:
                    if c.tag == pS.ADDRESS:
                        if c.attrib[pS.ADDRTYPE] == pS.IPV4:
                            n += 1
                            hosts[n] = {pS.IP: c.attrib[pS.ADDR]}
                            self.logger.info(pS.LOG_SEPERATOR)
                            self.logger.info(pS.FOUND_IP_.format(c.attrib[pS.ADDR]))
                        if c.attrib[pS.ADDRTYPE] == pS.MAC:
                            hosts[n][pS.MAC] = c.attrib[pS.ADDR]
                            self.logger.info(pS.MAC_ID_.format(c.attrib[pS.ADDR]))
                            if pS.VENDOR in c.attrib:
                                hosts[n][pS.VENDOR] = c.attrib[pS.VENDOR]
                                self.logger.info(pS.VENDOR_.format(c.attrib[pS.VENDOR]))

        self.remove_nmap_temp_file()

        return hosts

    def get_ip_by_mac(self, hosts, mac):
        self.logger.info(pS.GET_IP_FROM_MAC.format(mac, hosts))
        root = self.start_nmap(hosts)

        last_ip = ''
        for child in root:
            if child.tag == pS.HOST:
                for c in child:
                    if c.tag == pS.ADDRESS:
                        if c.attrib[pS.ADDRTYPE] == pS.IPV4:
                            last_ip = c.attrib[pS.ADDR]
                        if c.attrib[pS.ADDRTYPE] == pS.MAC:
                            if mac == c.attrib[pS.ADDR]:
                                self.logger.info(pS.WIFI_WITH_MAC_HAS_IP_.format(mac, last_ip))
                                return last_ip

        self.remove_nmap_temp_file()

        self.logger.warning(pS.IP_WITH_MAC_NOT_FOUND.format(mac, hosts))
        return pS.NOT_FOUND

    def start_nmap(self, hosts):
        nm = nmap.PortScanner()
        nm.scan(hosts=hosts, arguments=pS.NMAP_ARGS)
        nm_mxl = nm.get_nmap_last_output()
        file = open(pS.TEMP_XML, pS.WRITE)
        file.write(nm_mxl)
        file.close()
        tree = Et.parse(pS.TEMP_XML)
        return tree.getroot()

    def remove_nmap_temp_file(self):
        os.remove(pS.TEMP_XML)

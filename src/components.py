import json
import os
from ipaddress import IPv4Address, IPv6Address

import requests
from validate_email import validate_email


def email_validator(email_id: str) -> bool:
    """
    :param email_id: The email id of the author to be validated
    :return: The state of the email (active or inactive)
    """
    return validate_email(
        email_address=email_id,
        # Pattern matching
        check_format=True,
        # Checking against blacklisted domains
        check_blacklist=True,
        # Checking the MX records
        check_dns=True,
        # Seconds until DNS timeout
        dns_timeout=10,
        # Checking SMTP initialization
        check_smtp=True,
        # Seconds until SMTP timeout
        smtp_timeout=10,
        # Do not skip TLS negotiation
        smtp_skip_tls=False,
        # SLContext to use with the TLS negotiation with the server
        smtp_tls_context=None,
        # Deactivate smtplib's debug output
        smtp_debug=False,
        # Use IPv4 and IPv6 addresses
        address_types=frozenset([IPv4Address, IPv6Address]))


def github_api_call(url: str) -> json:
    """
    :param url: The GitHub API endpoint which should be called
    :return: The JSON response returned by the API call
    """
    return requests.get(url, headers={
        'Authorization': f"token {os.getenv('GITHUB_API_AUTH_TOKEN')}",
    }).json()


def calculate_severity(confidence: str, severity: str) -> int:
    """
    :param confidence: Confidence of the vulnerability occurring
    :param severity: Severity of the vulnerability occurring
    :return: Comprehensive score of the identified vulnerability
    """
    score_allocation = {
        "HIGH": 10,
        "MEDIUM": 7.5,
        "LOW": 5,
        "UNDEFINED": 2.5,
    }
    return score_allocation[confidence] * score_allocation[severity]


def NormalizeData(value, old_minimum, old_maximum, new_minimum, new_maximum):
    """
    :param value: Value to be brought in the new range
    :param old_minimum: Minimum of the old range
    :param old_maximum: Maximum of the old range
    :param new_minimum: Minimum of the new range
    :param new_maximum: Maximum of the new range
    :return: Value corresponding to the new range
    """
    return ((value - old_minimum) / (old_maximum - old_minimum)) * (new_maximum - new_minimum) + new_minimum

#!/bin/bash

open http://greengov2015.dev/
cd `dirname $0`
/usr/local/bin/grunt watch
$SHELL
#!/bin/bash
sed -E 's/PUSH([[:digit:]]*) 0x/PUSH\10x/g' core/dmap.asm | sed -E 's/ /\
/g' | sed -E 's/PUSH([[:digit:]]*)0x/PUSH\1 0x/g'

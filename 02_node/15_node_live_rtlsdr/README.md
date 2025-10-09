This example needs the [rtl-sdr library](https://osmocom.org/projects/rtl-sdr/wiki) installed.

## macOS

On macOS, I needed to run

```
brew install librtlsdr
```

and then copy the library file to the this directory, so that Node finds it (under a specific name)

```
cp /System/Volumes/Data/opt/homebrew/lib/librtlsdr.0.dylib librtlsdr.so.0
```

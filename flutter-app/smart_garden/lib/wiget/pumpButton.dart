import 'package:clay_containers/clay_containers.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:provider/provider.dart';
import 'package:smart_garden/ultis/socketIO_handler.dart';

// Color baseColor = Color.fromRGBO(244, 244, 244, 1.0);
Color baseColor = Color(0xFFF2F2F2);

class PumpButton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ListenableProvider<socketIO_Handler>.value(
        value: Provider.of<socketIO_Handler>(context),
        builder: (context, child) {
          return PumpButtonNotifier();
        });
  }
}

class PumpButtonNotifier extends StatefulWidget {
  @override
  _PumpButtonNotifierState createState() => _PumpButtonNotifierState();
}

class _PumpButtonNotifierState extends State<PumpButtonNotifier> {
  bool switchState = false;
  @override
  Widget build(BuildContext context) {
    final dataFromSocket = Provider.of<socketIO_Handler>(context);
    if (dataFromSocket.clientState != null) {
      var gestureDetector = GestureDetector(
        onTap: () => {print("Call Button"), dataFromSocket.emitRequestPump()},
        child: ClayContainer(
          emboss: dataFromSocket.tooglePump,
          color: baseColor,
          width: 100,
          height: 100,
          child: Center(child: SvgPicture.asset('assets/water.svg')),
        ),
      );
      return dataFromSocket.clientState
          ? Container(
              // color: Colors.black12,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Transform.scale(
                    scale: 1.3,
                    child: CupertinoSwitch(
                      value: dataFromSocket.tooglePump,
                      onChanged: (state) {
                        setState(() {
                          // if (state) {
                          dataFromSocket.emitRequestPump();
                          // }
                          // switchState = !switchState;
                        });
                      },
                    ),
                  ),
                  Container(
                    padding: EdgeInsets.all(4),
                    decoration: BoxDecoration(
                        color: Color.fromRGBO(255, 255, 255, 1.0),
                        borderRadius: BorderRadius.circular(12)),
                    margin: EdgeInsets.only(left: 15),
                    child: SvgPicture.asset(
                      'assets/water.svg',
                      width: 40,
                      height: 40,
                    ),
                  )
                ],
              ),
            )
          : CircularProgressIndicator();
    } else {
      return CircularProgressIndicator();
    }
  }
}
